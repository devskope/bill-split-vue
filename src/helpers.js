export const buildPath = (a, b) => `${a}${b || ''}`;

export const capitalize = str => str[0].toUpperCase() + str.substring(1);

export const keygen = prefix => `${prefix}-${String(Math.random()).substring(2, 8)}`;

export const validator = {
  isEmail: string => /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    string,
  ),
  notEmpty: string => string !== '',
  minLength: (data, length) => data.length >= length,
  passMatch: (a, b) => [a, b].every(validator.notEmpty) && a === b,
  validate: (...validators) => validators.every(Boolean),
};

export const stripAttribute = (object, value) => Object.keys(object).reduce(
  (filteredObject, key) => (object[key] !== value
    ? { ...filteredObject, [key]: object[key] }
    : filteredObject),
  {},
);
