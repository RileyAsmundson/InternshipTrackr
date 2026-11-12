const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

// Session authentication  
const session = require('express-session');
const authRoutes = require('./auth');

// Database connection
const { db } = require('./db');

// Password hashing
const bcrypt = require('bcryptjs');

// Registration validation
const validateRegistration = require('./validateRegistration');

// Initialize Express
const app = express();

// Configure Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main'
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve CSS, JavaScript, and images
app.use('/resources',
  express.static(path.join(__dirname, 'resources'))
);

// Allow Express to process form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'Set SESSION_SECRET in your local .env or .env.test'
  );
}

// Session configuration for local development and lab testing.
app.use(session({
  name: 'internshiptrackr.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
  }
}));

// Make login status available to Handlebars templates.
app.use((req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.username);
  next();
});

// Register the login and logout routes.
app.use(authRoutes);


const browseCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

app.get('/browse', async (req, res) => {

  // Read search filters from the URL
  const search = typeof req.query.search === 'string'
    ? req.query.search.trim().slice(0, 100)
    : '';

  const company = typeof req.query.company === 'string'
    ? req.query.company.trim().slice(0, 100)
    : '';

  const stateInput = typeof req.query.state === 'string'
    ? req.query.state.trim().toUpperCase()
    : '';

  const state = /^[A-Z]{2}$/.test(stateInput)
    ? stateInput
    : '';

  const cacheKey = JSON.stringify([search, company, state]);

  try {
    let internships;
    const cached = browseCache.get(cacheKey);

    if (cached &&
        Date.now() - cached.time < CACHE_DURATION) {
      internships = cached.data;

    } else {
      // Build the Headcount Labs API request
      const params = new URLSearchParams({
        title_advanced: '(intern OR internship OR internships)',
        country: 'US',
        currentness: 'current',
        stale: 'false',
        has_application_url: 'true',
        limit: '30'
      });

      if (search) params.set('q', search);
      if (company) params.set('company', company);
      if (state) params.set('state', state);

      const apiKey = process.env.HEADCOUNTLABS_API_KEY;

      if (!apiKey) {
        throw new Error('Headcount Labs API key is missing');
      }

      const response = await fetch(
        `https://api.headcountlabs.com/v1/jobs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          signal: AbortSignal.timeout(15000)
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error('Unexpected API response');
      }

      // Convert API records into internship cards
      internships = result.data.map(job => {

        const posting = job.postings?.find(p =>
          p.posting_status === 'listed' &&
          p.application_url?.state === 'known' &&
          /^https?:\/\//.test(p.application_url.value)
        );

        if (!posting ||
            job.title?.state !== 'known' ||
            job.employer_name?.state !== 'known') {
          return null;
        }

        const locationData =
          posting.location?.state === 'known'
            ? posting.location.value
            : job.locations?.find(l => l.state === 'known')?.value;

        const region = locationData?.state ||
          locationData?.region?.replace(/^US-/, '');

        const location = [
          locationData?.city,
          region
        ].filter(Boolean).join(', ') || 'Not specified';

        const description = job.description?.state === 'known'
          ? job.description.value
          : '';

        return {
          id: job.job_id,
          company: job.employer_name.value,
          role: job.title.value,
          location,
          description: description
            ? description.slice(0, 250) +
              (description.length > 250 ? '...' : '')
            : 'No description available.',
          applicationUrl: posting.application_url.value
        };
      }).filter(Boolean);

      // Save results temporarily to reduce API usage
      browseCache.set(cacheKey, {
        time: Date.now(),
        data: internships
      });
    }

    res.render('pages/browse', {
      internships,
      search,
      company,
      state
    });

  } catch (error) {
    console.error('Headcount Labs Error:', error);

    res.status(502).render('pages/browse', {
      internships: [],
      search,
      company,
      state,
      error: 'Unable to load internships right now.'
    });
  }
});

//some (temporary) routes so the website works
//(all able to be deleted if not needed, just so the website is fully functional for now) 
app.get('/login', (req, res) => {
  res.render('pages/login');
});


app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', async (req, res) => {
  // Validate registration information before processing
  if (!validateRegistration(req.body)) {
    return res.status(400).send('Invalid input');
  } 

  // Get information entered in register.hbs
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  try {

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Our database currently requires a username,
    // so use the email as the username
    const username = email;

    // Save user to database
    await db.none(
      `INSERT INTO users
       (username, password, email, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        username,
        hashedPassword,
        email,
        firstName,
        lastName
      ]
    );

    // Successful registration
    res.redirect('/login');

  } catch (error) {
    // reject an email that is already registered 
    if (error.code === '23505'){
      return res.status(409).render('pages/register', {
        error: 'An account with this email already exists.'
      });
    }
    console.error('Registration Error:', error);
    res.status(500).send('Registration failed');
  }

}); 

app.get('/', (req, res) => {
  res.redirect('/home');
});


app.get('/tracker', (req, res) => {
  res.render('pages/tracker');
});

// home page/ dashboard. will need to change the names maybe but basic for rn


app.get('/home', async (req, res) => {
  try {
    //  user
    const username = req.session?.username;

    if (!username) {
      return res.redirect('/login');
    }

    // user's first name
    const userResult = await db.query(
      'SELECT first_name FROM users WHERE username = $1',
      [username]
    );

    if (userResult.length === 0) {
      return res.status(404).send('User not found');
    }

    const firstName = userResult[0].first_name;

    //  user's applications
    const applicationResult = await db.query(
      'SELECT status FROM applications WHERE user_id = $1',
      [username]
    );

    const applications = applicationResult;

    //  total interviews
    const interviewResult = await db.query(
      'SELECT COUNT(*) AS total FROM interviews WHERE user_id = $1',
      [username]
    );

    // dashboard numbers 
    const totalApplications = applications.length;
    const totalInterviews = Number(interviewResult[0].total);

    const totalOffers = applications.filter(
      app => String(app.status).toLowerCase() === 'offer'
    ).length;

    // upcoming deadlines
    const deadlineResult = await db.query(
      `SELECT COUNT(*) AS total
       FROM deadlines
       WHERE user_id = $1
         AND completed = FALSE
         AND deadline_date >= CURRENT_DATE
         AND deadline_date < CURRENT_DATE + INTERVAL '14 days'`,
      [username]
    );

    const upcomingDeadlines = Number(deadlineResult[0].total);

    // upcoming tasks
    const tasks = await db.query(
      `SELECT id,
              title,
              TO_CHAR(deadline_date, 'Mon DD, YYYY') AS "dueDate",
              (deadline_date - CURRENT_DATE) AS "daysLeft"
       FROM deadlines
       WHERE user_id = $1
         AND completed = FALSE
         AND deadline_date >= CURRENT_DATE
       ORDER BY deadline_date ASC
       LIMIT 10`,
      [username]
    );

    // status categories
    const applicationStatuses = [
      { name: 'Saved', count: 0, color: '#3498db' },
      { name: 'Applied', count: 0, color: '#2ecc71' },
      { name: 'Interviewing', count: 0, color: '#f1c40f' },
      { name: 'Rejected', count: 0, color: '#e74c3c' },
      { name: 'Offer', count: 0, color: '#9b59b6' }
    ];

    // each application status
    applications.forEach(app => {
      const status = applicationStatuses.find(
        item => item.name.toLowerCase() ===
          String(app.status).toLowerCase()
      );

      if (status) {
        status.count++;
      }
    });

    //  pie chart percentages
    let currentPercent = 0;
    const slices = [];

    applicationStatuses.forEach(status => {
      const percent = totalApplications > 0
        ? (status.count / totalApplications) * 100
        : 0;

      if (percent > 0) {
        const nextPercent = currentPercent + percent;

        slices.push(
          `${status.color} ${currentPercent}% ${nextPercent}%`
        );

        currentPercent = nextPercent;
      }
    });

    // create pie chart
    const statusGradient = slices.length > 0
      ? `conic-gradient(${slices.join(', ')})`
      : 'conic-gradient(#e1e7ef 0% 100%)';

    // to home.hbs
    res.render('pages/home', {
      username: firstName,
      totalApplications,
      totalInterviews,
      totalOffers,
      upcomingDeadlines,
      tasks,
      applicationStatuses,
      statusGradient
    });

  } catch (error) {
    console.error('Home Dashboard Error:', error);
    res.status(500).send('Error loading dashboard');
  }
});


const calendarSearchCache = new Map();
const CALENDAR_SEARCH_CACHE_DURATION = 30 * 60 * 1000;

app.get('/calendar/search', async (req, res) => {
  if (!req.session?.username) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const search = typeof req.query.search === 'string'
    ? req.query.search.trim().slice(0, 100)
    : '';

  if (!search) {
    return res.json({ internships: [] });
  }

  const cached = calendarSearchCache.get(search);
  if (cached &&
      Date.now() - cached.time < CALENDAR_SEARCH_CACHE_DURATION) {
    return res.json({ internships: cached.data });
  }

  try {
    const apiKey = process.env.HEADCOUNTLABS_API_KEY;
    if (!apiKey) {
      throw new Error('Headcount Labs API key is missing');
    }

    const params = new URLSearchParams({
      title_advanced: '(intern OR internship OR internships)',
      country: 'US',
      currentness: 'current',
      stale: 'false',
      has_application_url: 'true',
      limit: '30',
      q: search
    });

    const response = await fetch(
      `https://api.headcountlabs.com/v1/jobs?${params}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result.data)) {
      throw new Error('Unexpected API response');
    }

    const internships = result.data.map(job => {
      const posting = job.postings?.find(p =>
        p.posting_status === 'listed' &&
        p.application_url?.state === 'known' &&
        /^https?:\/\//.test(p.application_url.value)
      );

      if (!posting ||
          job.title?.state !== 'known' ||
          typeof job.title.value !== 'string' ||
          job.employer_name?.state !== 'known' ||
          typeof job.employer_name.value !== 'string' ||
          (typeof job.job_id !== 'string' &&
           typeof job.job_id !== 'number')) {
        return null;
      }

      const locationData =
        posting.location?.state === 'known'
          ? posting.location.value
          : job.locations?.find(l => l.state === 'known')?.value;

      const region = locationData?.state ||
        locationData?.region?.replace(/^US-/, '');

      const location = [
        locationData?.city,
        region
      ].filter(Boolean).join(', ') || 'Not specified';

      const company = job.employer_name.value.trim();

      if (!company ||
          company.length > 100 ||
          !job.title.value.trim() ||
          location.length > 100) {
        return null;
      }

      return {
        id: job.job_id,
        company,
        role: job.title.value.trim(),
        location
      };
    }).filter(Boolean);

    calendarSearchCache.set(search, {
      time: Date.now(),
      data: internships
    });

    return res.json({ internships });
  } catch (error) {
    console.error('Calendar Internship Search Error:', error);
    return res.status(502).json({
      error: 'Unable to search internships right now.'
    });
  }
});

// Save an interview linked to an existing internship.
app.post('/calendar', async (req, res) => {
  const username = req.session?.username;
  if (!username) {
    return res.redirect('/login');
  }

  const { company: rawCompany, location: rawLocation, date, time } =
    req.body || {};
  const company = typeof rawCompany === 'string' ? rawCompany.trim() : '';
  const location = typeof rawLocation === 'string' ? rawLocation.trim() : '';
  const validDate = typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)) &&
    new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date;
  const validTime = typeof time === 'string' &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);

  if (!company ||
      company.length > 100 ||
      !location ||
      location.length > 100 ||
      !validDate ||
      !validTime) {
    return res.status(400).send('Invalid interview information');
  }

  try {
    const interview = await db.tx(async transaction => {
      const internships = await transaction.any(
        `SELECT id
         FROM internships
         WHERE LOWER(BTRIM(company)) = LOWER($1)
           AND LOWER(BTRIM(location)) = LOWER($2)
         ORDER BY id
         LIMIT 2`,
        [company, location]
      );

      if (internships.length !== 1) {
        return null;
      }

      return transaction.one(
        `INSERT INTO interviews
           (internship_id, user_id, interview_date, interview_time, status)
         VALUES ($1, $2, $3, $4, 'Scheduled')
         RETURNING id`,
        [internships[0].id, username, date, time]
      );
    });

    if (!interview) {
      return res.status(400).send(
        'Company and location must match exactly one existing internship'
      );
    }

    return res.redirect('/calendar');
  } catch (error) {
    console.error('Calendar Interview Error:', error);
    return res.status(500).send('Unable to save interview');
  }

});

// Calendar route for setting up the calendar page.
app.get('/calendar', async (req, res) => {
  const username = req.session?.username;
  if (!username) {
    return res.redirect('/login');
  }

  const today = new Date();
  const year = Number(req.query.year) || today.getFullYear();
  const requestedMonth = Number(req.query.month);
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth - 1
    : today.getMonth();

  const formatDate = date => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');

  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  let interviews;

  try {
    interviews = await db.any(
      `SELECT TO_CHAR(interview.interview_date, 'YYYY-MM-DD') AS "interviewDate",
              TO_CHAR(interview.interview_time, 'HH12:MI AM') AS "interviewTime",
              COALESCE(internship.company, 'Interview') AS company,
              COALESCE(internship.title, 'Interview') AS role
       FROM interviews AS interview
       LEFT JOIN internships AS internship
         ON internship.id = interview.internship_id
       WHERE interview.user_id = $1
         AND interview.interview_date >= $2::DATE
         AND interview.interview_date < $3::DATE
       ORDER BY interview.interview_date, interview.interview_time`,
      [username, formatDate(monthStart), formatDate(nextMonthStart)]
    );
  } catch (error) {
    console.error('Calendar Interview Lookup Error:', error);
    return res.status(500).send('Unable to load calendar interviews');
  }

  const interviewsByDate = new Map();
  interviews.forEach(interview => {
    const dateInterviews =
      interviewsByDate.get(interview.interviewDate) || [];
    dateInterviews.push(interview);
    interviewsByDate.set(interview.interviewDate, dateInterviews);
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1);
    const dateKey = formatDate(date);

    return {
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
      interviews: interviewsByDate.get(dateKey) || []
    };
  });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const previousMonth = new Date(year, month - 1, 1);
  const followingMonth = new Date(year, month + 1, 1);

  res.render('pages/calendar', {
    monthYear: monthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weeks,
    previousMonth: {
      year: previousMonth.getFullYear(),
      month: previousMonth.getMonth() + 1
    },
    nextMonth: {
      year: followingMonth.getFullYear(),
      month: followingMonth.getMonth() + 1
    }
  });
});


module.exports = app;