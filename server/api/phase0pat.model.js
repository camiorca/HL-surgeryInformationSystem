const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseZeroPatient = new Schema(
  {
    phase: {type: Number},
    synthompsDescription: {type: String},
    vitalConstants: {type: String},
    o2saturation: {type: String},
    patientId: {type: String}
  },
  { collection: "phaseZeroPatients" }
);

module.exports = mongoose.model("phaseZerosPatients", phaseZeroPatient);