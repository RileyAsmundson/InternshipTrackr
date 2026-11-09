const { expect } = require('chai');
const validateRegistration = require('../src/validateRegistration');

describe('Registration validation', () => {
  it('rejects a missing password', () => {
    expect(validateRegistration({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@example.com'
    })).to.equal(false);
  });
});