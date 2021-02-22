const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseZeroMed = new Schema(
  {
    patientId: {type: String},
    doctorId: {type: String},
    synthompsDescription: {type: String},
    vitalConstants: {type: String},
    o2saturation: {type: String}
  },
  { collection: "phaseZeroMed" }
);

module.exports = mongoose.model("phaseZerosMeds", phaseZeroMed);