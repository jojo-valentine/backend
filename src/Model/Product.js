const { request } = require("http");
const { required } = require("joi");
const mongoose = require("mongoose");
const { type } = require("os");
const ImageProduct = require("../Model/ImageProduct");
const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users_collection",
      required: true,
    },
    nameProduct: {
      type: String,
      required: true,
      // unique: true,
    },
    priceProduct: {
      type: Number,
      required: true,
    },
    detailProduct: {
      type: String,
      required: true,
    },
    activeProduct: {
      type: Boolean,
      required: false,
    },
    discountProduct: {
      type: Number,
      required: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    deletedAt: { type: Date, default: null },
    toJSON: { virtuals: true }, // เพิ่มการตั้งค่านี้
    toObject: { virtuals: true }, // เพิ่มการตั้งค่านี้
  }
);
productSchema.virtual(
  "images",
  {
    ref: "products_image_collection",
    localField: "_id",
    foreignField: "productId",
    justOne: false,
  },
  "user_id",
  {
    ref: "users_collection",
    localField: "_id",
    foreignField: "_id",
    justOne: false,
  }
);
const Product = mongoose.model("products_collection", productSchema);
module.exports = Product;
