const Joi = require("joi");
const Product = require("../Model/Product");
const productValidationSchema = Joi.object({
  // user_id: Joi.string()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.error("any.invalid");
  //     }
  //     return value;
  //   })
  //   .required()
  //   .messages({
  //     "any.required": "User ID is required",
  //     "any.invalid": "User ID must be a valid ObjectId",
  //   }),
  nameProduct: Joi.string().max(255).required().messages({
    "string.base": "nameProduct must be a string.",
    "string.max": "nameProduct must be less than or equal to 255 characters.",
    "any.required": "nameProduct is required.",
  }),
  priceProduct: Joi.number()
    .max(999999) // Example maximum value
    .allow(null)
    .messages({
      "number.base": "priceProduct must be a number.",
      "number.max": "priceProduct must not exceed the maximum value.",
    }),
  detailProduct: Joi.string().max(6000).allow(null).messages({
    "string.base": "detailProduct must be a string.",
    "string.max":
      "detailProduct must be less than or equal to 6000 characters.",
  }),
  activeProduct: Joi.boolean().messages({
    "boolean.base": "activeProduct must be true or false.",
  }),
  discountProduct: Joi.number().allow(null, "").messages({
    "number.base": "discountProduct must be a number.",
  }),
});

const validateProduct = (data) => {
  const { error, value } = productValidationSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    // console.error(
    //   "Validation failed:",
    //   error.details.map((detail) => detail)
    // );

    const errorMessages = error.details.map((detail) => ({
      // field: detail.path[0],
      field: detail.context.key,
      message: detail.message,
    }));

    return { isValid: false, errors: errorMessages };
  }
  return { isValid: true, value };
};
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 5 * 1024 * 1024; // 5MB

const validateProductImagesSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      type: Joi.string()
        .valid(...allowedTypes)
        .required()
        .messages({
          "any.only": "Only images of type jpeg, png, or gif are allowed.",
        }),
      size: Joi.number()
        .max(maxSize)
        .required()
        .messages({
          "number.max": `File size must be less than or equal to ${
            maxSize / 1024 / 1024
          }MB.`,
          "number.base": "File size must be a valid number.",
        }),
    })
  )
  .max(5)
  .messages({
    "array.max": "Product images cannot exceed 5 images.",
  });

const validateProductImages = (files) => {
  // console.log("files", files);
  const formattedFiles = files.map((file) => ({
    name: file.originalname, // ใช้ originalname แทน name
    type: file.mimetype, // ใช้ mimetype แทน type
    size: file.size, // ขนาดไฟล์
  }));
  const { error, value } = validateProductImagesSchema.validate(
    formattedFiles,
    {
      abortEarly: false,
    }
  );

  if (error) {
    console.error(
      "Validation productImage  failed:",
      error.details.map((detail) => detail)
    );
    const errorMessagesProductImages = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));
    return { isValid: false, errors: errorMessagesProductImages };
  }
  return { isValid: true, errors: value };
};

module.exports = { validateProduct, validateProductImages };
