const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseTwoPatient = new Schema(
  {
    phase: {type: Number},
    riskLevel: {type: String},
    anesteticTecnique: {type: String},
    surgicalTecnique: {type: String},
    patientId: {type: String}
  },
  { collection: "phaseTwoPatients" }
);

module.exports = mongoose.model("phaseTwosPatients", phaseTwoPatient);