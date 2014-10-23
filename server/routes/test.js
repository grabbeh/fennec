var helper = require('./helper')
, express = require('express')
, db = require('../config/paid-db.js')
, mongoose = require('mongoose')
, app = express()
, async = require('async');

mongoose.connect(db, function(err){
    if (err) { console.log(err); throw new Error(err.stack);}
  });

var d = new Date();
console.log("new Date")
console.log(d);
var j = JSON.stringify(d);
console.log("Stringified date")
console.log(j);
console.log("Parsed date")
console.log(JSON.parse(j));
console.log("new Date + JSON parse")
console.log(new Date(JSON.parse(j)));

app.get('/', function(req, res){
   
    // returns old format
    helper.getTrademark("53c8e75f730766d56dd6aba0", function(err, trademark){
        //console.log(trademark.registrationDate.DDate);
        //console.log(j);
        

        res.json(trademark);
    });



})

app.listen(2001);
console.log("Server listening on port 2001");

