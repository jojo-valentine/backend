// path-to-your-validation/RegisterValidator.js
const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
// Define validation schema for registration
const registrationSchema = Joi.object({
  name: Joi.string().max(255).required().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must be less than or equal to 255 characters.",
    "any.required": "Name is required.",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
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

  password_confirm: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "string.base": "Password confirmation must be a string.",
      "any.required": "Password confirmation is required.",
      "string.empty": "Password confirmation cannot be empty.",
      "any.only": "Password confirmation does not match the password.",
    }),
});

// Define the validation function
const validateRegistration = (data) => {
  console.log(data);

  const { error, value } = registrationSchema.validate(data, {
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

module.exports = validateRegistration;
