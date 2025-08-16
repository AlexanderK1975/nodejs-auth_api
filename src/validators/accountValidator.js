import Joi from 'joi';

const passwordComplexity = (value, helpers) => {
  if (typeof value !== 'string') return helpers.error('any.invalid');

  if (!value || value.length < 12) return helpers.message('Password must be at least 12 characters long');
  if (!/[a-z]/.test(value)) return helpers.message('Password must include a lowercase letter');
  if (!/[A-Z]/.test(value)) return helpers.message('Password must include an uppercase letter');
  if (!/[0-9]/.test(value)) return helpers.message('Password must include a digit');
  if (!/[^A-Za-z0-9]/.test(value)) return helpers.message('Password must include a symbol');

  // TODO: In the future, forbid very common passwords, and password sililar to username
  return value;
}

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(8).max(64).required(),
  password: Joi.string().custom(passwordComplexity).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export { registerSchema, loginSchema };