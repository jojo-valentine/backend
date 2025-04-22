// path-to-your-validation/LoginValidator.js
const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
// Define validation schema for registration
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    // .regex(/usernameRegex/, "username")
    // .alphanum()
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.email": "Please provide a valid email address.",
      "any.required": "Email is required.",
      "string.empty": "Email cannot be empty.",
    }),

  password: Joi.string().required().messages({
    "string.base": "Password must be a string.",
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
  }),
});

const validateLogin = (data) => {
  const { error, value } = loginSchema.validate(data, {
    abortEarly: false, // Capture all validation errors if true find error return error to find input error
  });
  if (error) {
    // console.error(
    //   "Validation failed:",
    //   error.details.map((detail) => detail.message)
    // );
    const errorMessages = error.details.map((detail) => ({
      field: detail.context.key, // Extract field name
      message: detail.message, // Extract error message
    }));

    return { isValid: false, errors: errorMessages };
    // throw new AppError(
    //   `Validation Error: ${error.details.map((e) => e.message).join(", ")}`,
    //   400
    // );
  }
  return { isValid: true, value };
};

module.exports = validateLogin;
