const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let key = new Schema(
  {
    role: {type: String},
    key: {type: String},
  },
  { collection: "orgkeys" }
);

module.exports = mongoose.model("keys", key);