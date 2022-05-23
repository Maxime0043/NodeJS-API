const mongoose = require("mongoose");

module.exports.TacheSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  faite: {
    type: Boolean,
    required: true,
  },
});
