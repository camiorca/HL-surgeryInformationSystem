const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let phaseZero = new Schema(
  {
    patientId: {type: String},
    doctorId: {type: String},
    timestamp: {type: Date},
    phaseDate:{
        synthompsDescription: {type: String},
        vitalConstants: {type: String},
        o2saturation: {type: String}
    }
  },
  { collection: "phaseZero" }
);

module.exports = mongoose.model("phaseZeros", phaseZero);