const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { randomBytes } = require('node:crypto');
const { db } = require('./db');
const validatePhone = require('./validatePhone');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
    fields: 1,
    parts: 2
  }
});

// the profile route requires a logged in user
router.use((req, res, next) => {
  if (!req.session?.username) {
    return res.redirect('/login');
  }

  res.set('Cache-Control', 'no-store');

  if (!req.session.profileToken) {
    req.session.profileToken = randomBytes(32).toString('hex');
  }

  next();
});

// Load the current user's account information
async function renderProfile(req, res, status = 200, error = null) {
  const profile = await db.oneOrNone(
    `SELECT first_name, last_name, email, phone_number,
            profile_picture IS NOT NULL AS "hasPicture"
     FROM users
     WHERE username = $1`,
    [req.session.username]
  );

  if (!profile) {
    return res.status(404).send('Account not found.');
  }

  return res.status(status).render('pages/profile', {
    profile,
    error,
    csrfToken: req.session.profileToken,
    saved: !error && req.query.saved === '1'
  });
}

// Check that a submitted form belongs to this session
function checkFormToken(req, res, next) {
  if (
    typeof req.body?.csrfToken !== 'string' ||
    req.body.csrfToken !== req.session.profileToken
  ) {
    return res.status(403).send(
      'This form has expired. Return to your profile and try again.'
    );
  }

  next();
}

// Display the profile page
router.get('/', async (req, res) => {
  return renderProfile(req, res);
});

// Save or update the phone number
router.post('/phone', checkFormToken, async (req, res) => {
  if (!validatePhone(req.body.phoneNumber)) {
    return renderProfile(
      req,
      res,
      400,
      'Enter 7–15 digits, optionally starting with +.'
    );
  }

  const result = await db.result(
    'UPDATE users SET phone_number = $1 WHERE username = $2',
    [req.body.phoneNumber.trim(), req.session.username]
  );

  if (result.rowCount === 0) {
    return res.status(404).send('Account not found.');
  }

  return res.redirect('/profile?saved=1');
});

// Display the logged-in user's saved picture.
router.get('/picture', async (req, res) => {
  const user = await db.oneOrNone(
    'SELECT profile_picture FROM users WHERE username = $1',
    [req.session.username]
  );

  if (!user?.profile_picture) {
    return res.sendStatus(404);
  }

  res.set('X-Content-Type-Options', 'nosniff');

  return res.type('jpeg').send(user.profile_picture);
});

// Upload or replace the profile picture
router.post(
  '/picture',
  upload.single('profilePicture'),
  checkFormToken,
  async (req, res) => {
    if (!req.file) {
      return renderProfile(req, res, 400, 'Choose a picture first.');
    }

    let picture;

    try {
      const image = sharp(req.file.buffer, {
        limitInputPixels: 20000000
      });

      const metadata = await image.metadata();

      if (!['jpeg', 'png', 'webp'].includes(metadata.format)) {
        return renderProfile(
          req,
          res,
          400,
          'Choose a JPEG, PNG, or WebP picture.'
        );
      }

      picture = await image
        .rotate()
        .resize(256, 256, { fit: 'cover' })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      return renderProfile(
        req,
        res,
        400,
        'Unable to read this picture. Use a JPEG, PNG, or WebP under 2 MB and 20 megapixels.'
      );
    }

    const result = await db.result(
      'UPDATE users SET profile_picture = $1 WHERE username = $2',
      [picture, req.session.username]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Account not found.');
    }

    return res.redirect('/profile?saved=1');
  }
);

// Show upload and database errors on the profile page
router.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const uploadError = error instanceof multer.MulterError;
  const status = uploadError ? 400 : 500;

  const message = uploadError
    ? 'Upload one picture no larger than 2 MB.'
    : 'Unable to update or load your profile. Please try again.';

  if (!uploadError) {
    console.error('Profile Error:', error.message);
  }

  return renderProfile(req, res, status, message).catch(next);
});

module.exports = router;