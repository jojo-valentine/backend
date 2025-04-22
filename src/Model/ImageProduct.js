const mongoose = require("mongoose");
const Product = require("./Product");
const imageProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products_collection",
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ImageProduct = mongoose.model(
  "products_image_collection",
  imageProductSchema
);

module.exports = ImageProduct;
