const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

// Initialize Express
const app = express();
const PORT = 3000;

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
















// home page/ dashboard. will need to change the names maybe but basic for rn

app.get('/home', async (req, res) => {
  try {
    //  user
    const username = req.session.username;

    if (!username) {
      return res.redirect('/login');
    }

    // user's first name
    const userResult = await db.query(
      'SELECT first_name FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const firstName = userResult.rows[0].first_name;

    //  user's applications
    const applicationResult = await db.query(
      'SELECT status FROM applications WHERE user_id = $1',
      [username]
    );

    const applications = applicationResult.rows;

    //  total interviews
    const interviewResult = await db.query(
      'SELECT COUNT(*) AS total FROM interviews WHERE user_id = $1',
      [username]
    );

    // dashboard numbers 
    const totalApplications = applications.length;
    const totalInterviews = Number(interviewResult.rows[0].total);

    const totalOffers = applications.filter(
      app => app.status === 'Offer'
    ).length;

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
        item => item.name === app.status
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
      applicationStatuses,
      statusGradient
    });

  } catch (error) {
    console.error('Home Dashboard Error:', error);
    res.status(500).send('Error loading dashboard');
  }
});


// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
