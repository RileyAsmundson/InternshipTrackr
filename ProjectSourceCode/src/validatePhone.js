function validatePhone(value) {
  return (
    typeof value === 'string' &&
    /^\+?[0-9]{7,15}$/.test(value.trim())
  );
}

module.exports = validatePhone;