const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('./db');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};

  // Check that both fields were provided.
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).render('pages/login', {
      error: 'Enter your email and password.'
    });
  }

  try {
    // Registration currently uses the email as the username.
    const user = await db.oneOrNone(
      'SELECT username, password FROM users WHERE username = $1',
      [email]
    );

    // Reject unknown accounts and incorrect passwords.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('pages/login', {
        error: 'Invalid email or password.'
      });
    }

    // Create a fresh session after successful authentication.
    req.session.regenerate(error => {
      if (error) return next(error);

      req.session.username = user.username;

      // Save the session before redirecting.
      req.session.save(error => {
        if (error) return next(error);

        return res.redirect('/home');
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);

    res.clearCookie('internshiptrackr.sid', {
      path: '/'
    });

    res.redirect('/login');
  });
});

module.exports = router;