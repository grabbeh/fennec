var helper = require('./helper')
, Trademark = require('../models/trademarkSchema')
, express = require('express')
, db = require('../config/paid-db.js')
, mongoose = require('mongoose')
, app = express()
, async = require('async');

mongoose.connect(db, function(err){
    if (err) { console.log(err); throw new Error(err.stack);}
  });
/*
var d = new Date();
console.log("new Date")
console.log(d);
var j = JSON.stringify(d);
console.log("Stringified date")
console.log(j);
console.log("Parsed date")
console.log(JSON.parse(j));
console.log("new Date + JSON parse")
console.log(new Date(JSON.parse(j)));*/

Trademark.find({entity: "ACME INC"}).lean().exec(function(err, trademarks){
    trademarks.forEach(function(tm){
        if (tm.filingDate.DDate && tm.filingDate.DDate !instanceof Date){
            console.log("Not filing date object")
        }
        if (tm.registrationDate.DDate && tm.registrationDate.DDate !instanceof Date){
            console.log("Not registration date object")
        }
        if (tm.expiryDate.DDate && tm.expiryDate.DDate !instanceof Date){
            console.log("Not expiry date object")
        }
    })
})
/*
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
*/
