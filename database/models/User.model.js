const mongoose = require("mongoose");
const { UserSchema } = require("../schemas/User.schema");

module.exports.User = mongoose.model("User", UserSchema);
