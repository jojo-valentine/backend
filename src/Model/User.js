// const { request } = require("http");
const { request } = require("http");
const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      request: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Create the model
userSchema.pre("save", function (next) {
  const user = this;
  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((error) => {
      console.error(error);
    });
});
userSchema.virtual("products", {
  ref: "products_collection",
  localField: "_id",
  foreignField: "productId",
  justOne: false,
});
const User = mongoose.model("users_collection", userSchema);
module.exports = User;
// const newUser = new USer({
//   // name: 'jojo doe',
//   email: "jojo-valentine@gmail.com",
//   password: 'password',
// });
// n
