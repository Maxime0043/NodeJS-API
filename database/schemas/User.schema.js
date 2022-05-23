const mongoose = require("mongoose");

module.exports.UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  motdepasse: {
    type: String,
    required: true,
  },
});
