const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseTwo = new Schema(
  {
    patientId: {type: String},
    doctorId: {type: String},
    timestamp: {type: Date},
    phaseData:{
      riskLevel: {type: String},
      anesteticTecnique: {type: String},
      surgicalTecnique: {type: String}
    }
  },
  { collection: "phaseTwo" }
);

module.exports = mongoose.model("phaseTwos", phaseTwo);