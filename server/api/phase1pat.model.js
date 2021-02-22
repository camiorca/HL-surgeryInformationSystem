const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseOnePatient = new Schema(
  {
    phase: {type: Number},
    bloodTests: {type: String},
    electrocardiogramTest: {type: String},
    alergies: {type: String},
    patientId: {type: String}
  },
  { collection: "phaseOnePatients" }
);

module.exports = mongoose.model("phaseOnesPatients", phaseOnePatient);