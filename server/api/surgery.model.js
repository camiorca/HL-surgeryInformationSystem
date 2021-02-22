const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let surgery = new Schema(
  {
    patientName: {type: String},
    patientId: {type: String},
    doctorName: {type: String},
    doctorId: {type: String},
    surgeonName: {type: String},
    surgeonId: {type: String},
    legalAidName: {type: String},
    legalId: {type: String},
    signedConsent: {type: Boolean}
  },
  { collection: "surgical" }
);

module.exports = mongoose.model("surgeries", surgery);