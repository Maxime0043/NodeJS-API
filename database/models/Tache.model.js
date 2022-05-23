const mongoose = require("mongoose");
const { TacheSchema } = require("../schemas/Tache.schema");

module.exports.Tache = mongoose.model("Tache", TacheSchema);
