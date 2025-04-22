const mongoose = require("mongoose");
const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // Ensure the token is unique in the collection
    },
    exp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Optionally tracks createdAt and updatedAt
  }
);

const Blacklist = mongoose.model("blacklists_collection", blacklistSchema);

module.exports = Blacklist; // Export the model
