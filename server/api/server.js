var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const { exec } = require("child_process");
const users = require('./login.model');
const surgeries = require('./surgery.model');
const keys = require('./key.model');
const clauses = require('./clause.model');
//Phase0
const phase0global = require('./phase0.model');
const phase0med = require('./phase0med.model');
const phase0pat = require('./phase0pat.model');
//Phase1
const phase1global = require('./phase1.model');
const phase1pat = require('./phase1pat.model');
//Phase2
const phase2global = require('./phase2.model');
const phase2pat = require('./phase2pat.model');
const fs = require('fs');
const path = require('path');
var app = express();
var CryptoJS = require('crypto-js');
const fabricNetwork = require('./fabricNetwork')
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
//Routes
var registerRoute = '/home/camiorca/Downloads/mrk2/fabric-samples/fabcar/javascript/registerUser.js';
var invRoute = '/home/camiorca/Downloads/mrk2/fabric-samples/fabcar/javascript/invoke.js';
var queryRoute = '/home/camiorca/Downloads/mrk2/fabric-samples/fabcar/javascript/query.js';
//Keys
var salt = CryptoJS.lib.WordArray.random(128/8);
var iv = CryptoJS.lib.WordArray.random(128/8);           
console.log('salt  '+ salt );
console.log('iv  '+ iv );
var key128Bits100IterationsMed = CryptoJS.PBKDF2("MedPass", salt, { keySize: 256/32, iterations: 100 });

var mongoDB = 'mongodb://localhost:27017/tesis-js'
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

/**
 * The code here has two sections:
 * - Hyperledger interaction part, where one creates a transaction to be added to the blockchain generated given one
 * connection string.
 * - MongoDB part, used to check on the generated item to be inserted to the blocks.
 */
app.post('/api/registerDataPhaseZero', async function (req, res) {

  console.log(req.body)

  let medKey = await keys.findOne({'role': 'doctor'}).exec();
  let patKey = await keys.findOne({'role': 'patient'}).exec();

  try {
    const contract = await fabricNetwork.connectNetwork('connection-medplace1.json', 'wallet/wallet-medplace1');
    let phaseZeroData = {
        surgeryId: req.body.surgeryId,
        patientId: req.body.patientId,
        timestamp: Date.now(),
        date: Date(),
        phaseData: {
            synthompsDescription: CryptoJS.AES.encrypt(req.body.synthompsDescription, medKey.key).toString(),
            vitalConstants: CryptoJS.AES.encrypt(req.body.vitalConstants, medKey.key).toString(),
            o2saturation: CryptoJS.AES.encrypt(req.body.o2saturation, medKey.key).toString()
        },
    }
    phase0global.create(phaseZeroData, function(err,data){if(err) console.log(err)})
    let patientData = {
      phase: 0,
      patientId: req.body.patientId,
      synthompsDescription: CryptoJS.AES.encrypt(req.body.synthompsDescription, patKey.key, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString(),
      vitalConstants: CryptoJS.AES.encrypt(req.body.vitalConstants, patKey.key, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString(),
      o2saturation: CryptoJS.AES.encrypt(req.body.o2saturation, patKey.key, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString()
    }
    phase0pat.create(patientData, function(err, data){if(err) console.log(err)});
    let medData = {
      phase: 0,
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      synthompsDescription: CryptoJS.AES.encrypt(req.body.synthompsDescription.toString(), medKey.key).toString(),
      vitalConstants: CryptoJS.AES.encrypt(req.body.vitalConstants.toString(), medKey.key).toString(),
      o2saturation: CryptoJS.AES.encrypt(req.body.o2saturation.toString(), medKey.key).toString()
    }
    phase0med.create(medData, function(err, data){if(err) console.log(err)});
    console.log(JSON.stringify(patientData))
    console.log(JSON.stringify(phaseZeroData));
    let tx = await contract.submitTransaction('addAsset', JSON.stringify(phaseZeroData));
    exec("node /home/camiorca/Downloads/mrk2/fabric-samples/fabcar/javascript/invoke.js", (error, stdout, stderr) => {
    })
    res.json({
      status: 'OK - Transaction has been submitted',
      txid: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }

});

app.post('/api/registerDataPhaseOne', async function (req, res) {

  let medKey = await keys.findOne({'role': 'doctor'}).exec();
  let patKey = await keys.findOne({'role': 'patient'}).exec();
  let surKey = await keys.findOne({'role': 'surgeon'}).exec();

  try {
      const contract = await fabricNetwork.connectNetwork('connection-medplace1.json', 'wallet/wallet-medplace1');
      let phaseOneData = {
          id: req.body.id,
          surgeryId: req.body.surgeryId,
          pacientId: req.body.pacientId,
          timestamp: Date.now(),
          date: Date(),
          phaseData: {
              bloodTests: CryptoJS.AES.encrypt(req.body.bloodTests, medKey.key).toString(),
              electrocardiogramTest: CryptoJS.AES.encrypt(req.body.electrocardiogramTest, medKey.key).toString(),
              alergies: CryptoJS.AES.encrypt(req.body.alergies, medKey.key).toString()
          },
      }
      console.log(contract);
    let tx = await contract.submitTransaction('addAsset', JSON.stringify(tuna));
    phase1global.create(phaseOneData, function(err, data){if(err) console.log(err)});
    let patData = {
      phase: 1,
      patientId: req.body.patientId,
      bloodTests: CryptoJS.AES.encrypt(req.body.bloodTests, patKey.key).toString(),
      electrocardiogramTest: CryptoJS.AES.encrypt(req.body.electrocardiogramTest, patKey.key).toString(),
      alergies: CryptoJS.AES.encrypt(req.body.alergies, patKey.key).toString()
    }
    phase1pat.create(patData, function(err, data){if(err) console.log(err)});
    exec("node " + invRoute, (error, stdout, stderr) => {
    })
    res.json({
      status: 'OK - Transaction has been submitted',
      txid: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }

});


app.post('/api/registerDataPhaseTwo', async function (req, res) {

  let medKey = await keys.findOne({'role': 'doctor'}).exec();
  let patKey = await keys.findOne({'role': 'patient'}).exec();
  let surKey = await keys.findOne({'role': 'surgeon'}).exec();

  try {
    const contract = await fabricNetwork.connectNetwork('connection-medplace1.json', 'wallet/wallet-medplace1');
    let phaseTwoData = {
        id: req.body.id,
        surgeryId: req.body.surgeryId,
        pacientId: req.body.pacientId,
        timestamp: Date.now(),
        date: Date(),
        phaseData: {
            riskLevel: CryptoJS.AES.encrypt(req.body.riskLevel, medKey.key).toString(),
            anesteticTecnique: CryptoJS.AES.encrypt(req.body.anesteticTecnique, medKey.key).toString(),
            surgicalTecnique: CryptoJS.AES.encrypt(req.body.surgicalTecnique, medKey.key).toString()
        },
    }
    phase2global.create(phaseTwoData, function(err, data){});
    let patientData = {
      phase: 2,
      riskLevel: CryptoJS.AES.encrypt(req.body.riskLevel, patKey.key).toString(),
      anesteticTecnique: CryptoJS.AES.encrypt(req.body.anesteticTecnique, patKey.key).toString(),
      surgicalTecnique: CryptoJS.AES.encrypt(req.body.surgicalTecnique, patKey.key).toString()
    }
    phase2pat.create(patientData, function(err, data){});
    let surgeonData = {
      phase: 2,
      patientId: req.body.patientId,
      anesteticTecnique: CryptoJS.AES.encrypt(req.body.anesteticTecnique, surKey.key).toString(),
      surgicalTecnique: CryptoJS.AES.encrypt(req.body.surgicalTecnique, surKey.key).toString()
    }
    exec("node " + invRoute, (error, stdout, stderr) => {
    })
    let tx = await contract.submitTransaction('addAsset', JSON.stringify(phaseOneData));
    res.json({
      status: 'OK - Transaction has been submitted',
      txid: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }

});

app.post('/api/registerDataPhaseThree', async function (req, res) {

  try {
    const contract = await fabricNetwork.connectNetwork('connection-medplace1.json', 'wallet/wallet-medplace1');
    let phaseOneData = {
        id: req.body.id,
        surgeryId: req.body.surgeryId,
        pacientId: req.body.pacientId,
        timestamp: Date.now(),
        date: Date(),
        phaseData: {
          socialization: req.body.socialization
        },
    }

    let surgeonInfo = {
      riskLevel: CryptoJS.AES.encrypt(req.body.riskLevel, key128Bits100IterationsMed, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString(),
      anesteticTecnique: CryptoJS.AES.encrypt(req.body.anesteticTecnique, key128Bits100IterationsMed, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString(),
      surgicalTecnique: CryptoJS.AES.encrypt(req.body.surgicalTecnique, key128Bits100IterationsMed, {iv:iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString()
    }

    console.log(contract);
    let tx = await contract.submitTransaction('addAsset', JSON.stringify(phaseOneData));
    res.json({
      status: 'OK - Transaction has been submitted',
      txid: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }

});

app.post('/triggerContract', async function(req, res){
  const Template = require('@accordproject/cicero-core').Template;
  const template = await Template.fromDirectory('/home/camiorca/fabric-samples/surgery-network/server/test/data/consent');
  const consent = fs.readFileSync(path.resolve('/home/camiorca/fabric-samples/surgery-network/server/test/data/consent/text/', 'sample.md'), 'utf8');
  const Clause = require('@accordproject/cicero-core').Clause;
  const clause = new Clause(template);
  clause.parse(consent);

  const data = clause.getData();
  console.log(data);

  let patName = req.body.patName;
  let surName = req.body.surName;
  let legName = req.body.legName;
  const Engine = require('@accordproject/cicero-engine').Engine;
  const engine = new Engine();
  const request = {
    'patientName': patName,
    'surgeonName': surName,
    'legalName': legName,
    'date': '2017-11-12T17:38:01.412Z'
  };
  const state = {};
  state.$class = 'org.accordproject.cicero.contract.AccordContractState';
  state.stateId = 'org.accordproject.cicero.contract.AccordContractState#1';
  const result = await engine.init(clause);
  result.params = request;
  console.log(result);

  await clauses.create({clauseId: result.clause, data: request}, function(err, data){
    if(err) console.log(err);
  });
  res.status(200).send({data:result});

});

app.post('/login', async function(req, res){
  console.log(req.body)
  users.findOne({'user': req.body.user}, function(err, result){
    if(err){
      res.status(500).send("not ok");
    }
    else{
      console.log(result)
      console.log(result.get('clave'))
      console.log(req.body.password)
      if(result.get("clave") === req.body.password){
        var token = jwt.sign({data: {user: req.body.user, role:result.get('appRole')}, exp: Math.floor(Date.now() / 1000) + (60 * 60)}, "ProtoSecret");
        res.setHeader("Authorization", "Bearer " + token);
        res.status(200).send({message: "ok", data: result});
      }
      else{
        res.status(403).send("not ok");
      }
    }
  });
})

//Proving methods using a Mongo DB to check on created items on the Transaction Log
app.post('/createUser', async function(req, res){
  users.create(req.body, function(err, check){
    exec("node " + registerRoute +  ' ' + req.body.user,(error, stdout, stderr) => {
    })
    res.status(200).send({message: "added", data: check});
  })
});

app.get('/getUsers', async function(req, res){
  users.find({}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getDoctors', async function(req, res){
  users.find({'appRole': "doctor"}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getLegals', async function(req, res){
  users.find({'appRole': "legal"}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getSurgeons', async function(req, res){
  users.find({'appRole': "surgeon"}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getPatients', async function(req, res){
  users.find({'appRole': "patient"}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getSurgeries', async function(req, res){
  console.log("entered")
  surgeries.find({}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getPhaseZeroMed', async function(req, res){
  let medKey = await keys.findOne({'role': 'doctor'}).exec();
  phase0med.find({}, function(err, result){
    console.log(result)
    if(result.length > 0){
      result.forEach(element => {
        console.log(element.synthompsDescription.toString());
        let newSyntom = CryptoJS.AES.decrypt(element.synthompsDescription, medKey.key).toString(CryptoJS.enc.Utf8);
        console.log(newSyntom)
        element.synthompsDescription = newSyntom;

        let newVitalConstants =  CryptoJS.AES.decrypt(element.vitalConstants, medKey.key).toString(CryptoJS.enc.Utf8);
        element.vitalConstants = newVitalConstants;

        let newo2saturation = CryptoJS.AES.decrypt(element.o2saturation, medKey.key).toString(CryptoJS.enc.Utf8);
        element.o2saturation = newo2saturation;
      });
      res.status(200).send(result);
    }
  })
});

app.get('/getPhaseZeroPatient', async function(req, res){
  let patKey = await keys.findOne({'role': 'patient'}).exec();
  phase0pat.find({}, function(err, result){
    console.log(result)
    if(result.length > 0){
      result.forEach(element => {
        console.log(element.synthompsDescription.toString());
        let newSyntom = CryptoJS.AES.decrypt(element.synthompsDescription, patKey.key).toString(CryptoJS.enc.Utf8);
        console.log(newSyntom)
        element.synthompsDescription = newSyntom;

        let newVitalConstants =  CryptoJS.AES.decrypt(element.vitalConstants, patKey.key).toString(CryptoJS.enc.Utf8);
        element.vitalConstants = newVitalConstants;

        let newo2saturation = CryptoJS.AES.decrypt(element.o2saturation, patKey.key).toString(CryptoJS.enc.Utf8);
        element.o2saturation = newo2saturation;
      });
      res.status(200).send(result);
    }
  })
});

app.get('/getPhaseOnePatient', async function(req, res){
  let patKey = await keys.findOne({'role': 'patient'}).exec();
  phase1pat.find({}, function(err, result){
    console.log(result)
    if(result.length > 0){
      result.forEach(element => {
        let newbloodTests = CryptoJS.AES.decrypt(element.bloodTests, patKey.key).toString(CryptoJS.enc.Utf8);
        console.log(newbloodTests)
        element.bloodTests = newbloodTests;

        let newelectrocardiogramTest =  CryptoJS.AES.decrypt(element.electrocardiogramTest, patKey.key).toString(CryptoJS.enc.Utf8);
        element.electrocardiogramTest = newelectrocardiogramTest;

        let newalergies = CryptoJS.AES.decrypt(element.alergies, patKey.key).toString(CryptoJS.enc.Utf8);
        element.alergies = newalergies;
      });
      res.status(200).send(result);
    }
  })
});

app.get('/getPhaseTwoMed', async function(req, res){
  let medKey = await keys.findOne({'role': 'doctor'}).exec();
  phase2global.find({}, function(err, result){
    console.log(result)
    if(result.length > 0){
      result.forEach(element => {
        console.log(element.synthompsDescription.toString());
        let newriskLevel = CryptoJS.AES.decrypt(element.phaseData.riskLevel, medKey.key).toString(CryptoJS.enc.Utf8);
        element.phaseData.riskLevel = newriskLevel;

        let newanesteticTecnique =  CryptoJS.AES.decrypt(element.phaseData.anesteticTecnique, medKey.key).toString(CryptoJS.enc.Utf8);
        element.phaseData.anesteticTecnique = newanesteticTecnique;

        let newsurgicalTecnique = CryptoJS.AES.decrypt(element.phaseData.surgicalTecnique, medKey.key).toString(CryptoJS.enc.Utf8);
        element.phaseData.surgicalTecnique = newsurgicalTecnique;
      });
      res.status(200).send(result);
    }
  })
});

app.get('/getPhaseOne', async function(req, res){
  console.log("entered")
  phase1global.find({}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/getPhaseTwo', async function(req, res){
  console.log("entered")
  phase2global.find({}, function(err, result){
    res.status(200).send(result);
  })
});

app.get('/api/getPatient/:user', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-medplace1.json', 'wallet/wallet-medplace1');
    const result = await contract.evaluateTransaction('queryAsset', req.params.id.toString());
    exec("node " + queryRoute + " " + req.body.user, (error, stdout, stderr) => {
    })
    let response = JSON.parse(result.toString());
    res.json({result:response});
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
})


app.get('/api/getPatientInfo/:user', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-producer.json', 'wallet/wallet-producer');
    const historyPatient = JSON.parse((await contract.evaluateTransaction('getHistory', req.params.id.toString())).toString());
    const actualPatient = JSON.parse((await contract.evaluateTransaction('queryPatient', req.params.id.toString())).toString());
    historySushi.unshift(actualPatient);
    exec("node " + queryRoute + " " + req.body.user, (error, stdout, stderr) => {
    })
    res.json({
      historyPatient: historyPatient
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
})


app.listen(3000, '0.0.0.0', ()=>{
  console.log("***********************************");
  console.log("API server listening at localhost:3000");
  console.log("***********************************");
});