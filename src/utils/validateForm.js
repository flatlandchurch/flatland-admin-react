export default (fields, state) => {
  const errors = [];

  Object.keys(fields).forEach((key) => {
    const field = fields[key];

    if (field.required && typeof state[key] === 'object' && !Object.keys(state[key]).length) {
      errors.push(`${field.name} is required`);
    } else if (field.required && !state[key]) {
      errors.push(`${field.name} is required`);
    }
  });

  return errors;
};