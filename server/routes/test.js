var helper = require('./helper')
, express = require('express')
, Trademark = require('../models/trademarkSchema')
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
    async.forEach(trademarks, function(tm, callback){
        // if no date then defaults to 'false' hence the first check
        if (tm.filingDate.DDate && !(tm.filingDate.DDate instanceof Date)){
            tm.filingDate.DDate = new Date(tm.filingDate.DDate);
            Trademark.findOneAndUpdate({ _id: tm._id}, helper.removeId(tm), function(err, success){
                
            })
        }
        if (tm.registrationDate.DDate && !(tm.registrationDate.DDate instanceof Date)){
            tm.registrationDate.DDate = new Date(tm.registrationDate.DDate);
            Trademark.findOneAndUpdate({ _id: tm._id}, helper.removeId(tm), function(err, success){
                
            })
        }
        if (tm.expiryDate.DDate && !(tm.expiryDate.DDate instanceof Date)){
            tm.expiryDate.DDate = new Date(tm.expiryDate.DDate);
            Trademark.findOneAndUpdate({ _id: tm._id}, helper.removeId(tm), function(err, success){
                
            })
        }
        callback()
        }, function(err){
            console.log("Name updated")
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
