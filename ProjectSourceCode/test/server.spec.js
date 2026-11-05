const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const {db, pgp} = require('../src/db');
const bcrypt = require('bcryptjs');

chai.use(chaiHttp);
const {expect} = chai;

// Root hook: close the shared database pool after all tests in this process.
// Keep other suites in this file or reuse these imports in separate files.
after(() => {
  pgp.end();
});

describe('Welcome route', () => {
  it('returns the default welcome message', async () => {
    const res = await chai.request(app).get('/welcome');
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({
      status: 'success',
      message: 'Welcome!',
    });
  });
});

// Add your registration tests below.

describe('POST /register', () => {

  const { randomUUID } = require('node:crypto');

  // Create a unique test user
  const testUser = {
    firstName: 'Test',
    lastName: 'Student',
    email: `lab10_${randomUUID().slice(0, 12)}@example.test`,
    password: 'TestPassword123!'
  };

  // Remove test user from database
  async function removeTestUser() {
    await db.none(
      'DELETE FROM users WHERE username = $1',
      [testUser.email]
    );
  }

  beforeEach(removeTestUser);
  afterEach(removeTestUser);

  // Positive integration test
  it('registers a user with valid information', async () => {

    // Submit registration form
    const res = await chai.request(app)
      .post('/register')
      .redirects(0)
      .type('form')
      .send(testUser);

    // Verify successful redirect
    expect(res).to.have.status(302);
    expect(res).to.have.header('location', '/login');

    // Verify user was saved in PostgreSQL
    const rows = await db.any(
      `SELECT username, password, email, first_name, last_name
       FROM users
       WHERE username = $1`,
      [testUser.email]
    );

    expect(rows).to.have.lengthOf(1);
    expect(rows[0].email).to.equal(testUser.email);
    expect(rows[0].first_name).to.equal(testUser.firstName);
    expect(rows[0].last_name).to.equal(testUser.lastName);

    // Verify password was hashed correctly
    expect(rows[0].password).not.to.equal(testUser.password);

    expect(
      await bcrypt.compare(testUser.password, rows[0].password)
    ).to.equal(true);

  });

  // Negative integration test
  it('rejects registration without a password', async () => {

    // Submit registration without password
    const res = await chai.request(app)
      .post('/register')
      .type('form')
      .send({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        email: testUser.email
      });

    // Verify rejection response
    expect(res).to.have.status(400);
    expect(res.text).to.equal('Invalid input');

    // Verify no user was created
    const rows = await db.any(
      'SELECT username FROM users WHERE username = $1',
      [testUser.email]
    );

    expect(rows).to.have.lengthOf(0);
  });
});