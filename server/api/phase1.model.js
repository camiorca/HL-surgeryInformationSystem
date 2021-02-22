const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseOne = new Schema(
  {
    patientId: {type: String},
    doctorId: {type: String},
    timestamp: {type: Date},
    phaseDate:{
        bloodTests: {type: String},
        electrocardiogramTest: {type: String},
        alergies: {type: String}
    }
  },
  { collection: "phaseOne" }
);

module.exports = mongoose.model("phaseOnes", phaseOne);