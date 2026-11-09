const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

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


app.get('/browse', (req, res) => {

  // Temporary internship data
  const internships = [
    {
      company: 'Deloitte',
      role: 'Technology Consulting Intern',
      location: 'Denver, CO',
      description: 'Work on technology consulting projects.'
    },
    {
      company: 'Microsoft',
      role: 'Business Analyst Intern',
      location: 'Redmond, WA',
      description: 'Analyze business data and support decisions.'
    }
  ];


  // Filter by company, title, or location
  const search = typeof req.query.search === 'string'
    ? req.query.search.toLowerCase()
    : '';

  const results = internships.filter(job =>
    (job.company + ' ' + job.role + ' ' + job.location)
      .toLowerCase()
      .includes(search)
  );


res.render('pages/browse', { internships: results });
});
//some (temporary) routes so the website works
//(all able to be deleted if not needed, just so the website is fully functional for now) 
app.get('/login', (req, res) => {
  res.render('pages/login');
});


app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/calendar', (req, res) => {
  const today = new Date();
  const requestedYear = Number(req.query.year);
  const requestedMonth = Number(req.query.month);
  const year = Number.isInteger(requestedYear) && requestedYear >= 100 && requestedYear <= 9999
    ? requestedYear
    : today.getFullYear();
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth - 1
    : today.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1);
    return {
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === month
    };
  });
  const weeks = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  res.render('pages/calendar', {
    monthYear: new Date(year, month, 1).toLocaleDateString('en-US', {
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
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth() + 1
    }
  });
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


//calender route for adding events to the calendar
app.post('/calendar', async (req, res) => {
  const { title, date, time } = req.body;


});

//calender route for setting up the calendar page
app.get('/calendar', (req, res) => {
  const today = new Date();
  const year = Number(req.query.year) || today.getFullYear();
  const requestedMonth = Number(req.query.month);
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth - 1
    : today.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1);
    return {
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === month
    };
  });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  res.render('pages/calendar', {
    monthYear: new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weeks
  });
});


module.exports = app;