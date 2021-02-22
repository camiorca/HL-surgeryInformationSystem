const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let clause = new Schema(
  {
    clauseId: {type: String},
    data: {},
  },
  { collection: "clauses" }
);

module.exports = mongoose.model("clauses", clause);