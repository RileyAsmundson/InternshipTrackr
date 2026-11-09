function validateRegistration(input) {
  return Boolean(
    input &&
    typeof input.firstName === 'string' &&
    input.firstName.trim().length > 0 &&
    typeof input.lastName === 'string' &&
    input.lastName.trim().length > 0 &&
    typeof input.email === 'string' &&
    input.email.trim().length > 0 &&
    typeof input.password === 'string' &&
    input.password.length >= 8
  );
}

module.exports = validateRegistration;