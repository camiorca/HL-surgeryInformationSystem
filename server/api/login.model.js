const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let user = new Schema(
  {
    user: {type: String},
    clave: {type: String},
    name: {type: String},
    email: {type: String},
    cellphone: {type: Number},
    idNumber: {type: Number},
    appRole: {type: String}
  },
  { collection: "users" }
);

module.exports = mongoose.model("users", user);