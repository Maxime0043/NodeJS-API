require("dotenv").config();
const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@h3-intro-node.2zetg.mongodb.net/exam`
  )
  .then(() => console.log("Connected to mongo"))
  .catch((err) => console.error("Failed to connect to mongo, ", err));
