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
