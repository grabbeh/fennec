// saves trade mark portfolio to database

var moment = require('moment')
, trademark = require('../models/trademarkSchema');

function saveTrademarksToDatabase(portfolio, opts, fn){
    console.log(opts);
    portfolio.forEach(function(tm){
        var filingDateObject = {}
        , registrationDateObject = {}
        , expiryDateObject = {}; 
        if (tm[7] === "Pending" || tm[7] === "Published"){
             tm[6] = false;
        }
        if (tm[3].indexOf('/') != -1){
            filingDateObject.stringDate = tm[3];
            filingDateObject.DDate = new Date(moment(tm[3], 'MM-DD-YYYY').toISOString());
        }
        else {
            filingDateObject.stringDate = false;
            filingDateObject.DDate = false;
        }
        if (tm[5].indexOf('/') != -1){
            registrationDateObject.stringDate = tm[5];
            registrationDateObject.DDate = new Date(moment(tm[5], 'MM-DD-YYYY').toISOString());
        }
        else {
            registrationDateObject.stringDate = false;
            registrationDateObject.DDate = false;
        }

        if (tm[8].indexOf('/') != -1){
            expiryDateObject.stringDate = tm[8];
            expiryDateObject.DDate = new Date(moment(tm[8], 'MM-DD-YYYY').toISOString());
        }
        else {
            expiryDateObject.stringDate = false;
            expiryDateObject.DDate = false;
        }

        new trademark({
            entity: opts.entity,
            portfolio: opts.portfolio,
            mark: tm[1], 
            status: tm[7],
            country: tm[9],
            alpha3: tm[10],
            classes: tm[2],
            filingDate: filingDateObject,
            registrationDate: registrationDateObject,
            expiryDate: expiryDateObject,
            applicationNumber: tm[4],
            registrationNumber: tm[6]
        }).save(function(err){
            if (err) console.log(err)
        })
    })
    return fn(null, "Done");
}

module.exports = saveTrademarksToDatabase;
