
var mongoose = require('mongoose')
    , Agenda = require('agenda')
    , agenda = new Agenda()
    , helper = require('./helper')
    , user = require('./users')
    , html = require('./html')
    , email = require('./email')
    , async = require('async')
    , jobs = require('./jobs');

// Test dependencies

var moment = require("moment")
    , notification = require('./notification')
    , path = require("path")
    , mongoose = require('mongoose')
    , db = require('../config/paid-db')

mongoose.connect(db, function(err){
    if (err) { console.log(err); throw new Error(err.stack);}
  });


exports.setUpAgenda = function(db){
    agenda
      .database(db)
    
    agenda.define('check for alerts', function(job, done) {
          async.parallel([
                async.apply(user.getAllAdmins),
                async.apply(helper.getAllTrademarks)
            ], function(err, results){
                executeJobs(results[0], results[1], function(){
                    done();
                });
            });
        });
    
    agenda.define('email me', function(job, done){
        email.sendEmail("mbg@outlook.com", 'Test email', "<p>Hello! 24 hour job</p>", function(){
            done();
        });
    })
    
    agenda.every('1440 minutes', ['check for alerts', 'email me']);
    agenda.start();
}

function testAgenda(){
    agenda
    .database(db)
    agenda.define('test', function(job, done){
        executeJobs(admins, trademarks, function(){
            console.log("job completed");
            done();
        });
    })
    agenda.now('test')
    agenda.start();
}

function executeJobs(admins, trademarks, fn){
    async.forEach(admins, function(admin, callback){
    	async.forEach(admin.alertOptions, function(job, callback){
            if (job.checked && job.type === "recurring"){
              	jobs[job.functionName](admin, trademarks, function(){
                    
                })
            }
           callback();
    	}, function(){
            callback();
        })
    }, function(err){
        fn();
    })
}

var admins = [{
    entity: "ACME INC",
  __v: 0,
  _id: "mbg@outlook.com",
  alertFrequency: [
    {
      number: 1,
      type: "days"
    }
  ],
  alertOptions: [
    {
      checked: true,
      name: "Send alert when trade mark expires",
      functionName: "sendExpiredAlerts",
      type: "one-off"
    },
    {
      checked: true,
      name: "Send reminders for expiry",
      functionName: "sendExpiryAlerts",
      type: "recurring"
    },
    {
      checked: true,
      name: "Send alert when trade mark altered (edited, deleted, added)",
      functionName: "sendAlertOnChange",
      type: "one-off"
    }
  ],
  email: "mbg@outlook.com",
  isAdmin: true,
  username: "MBG@OUTLOOK.COM"
},{
    entity: "ACME INC",
  __v: 0,
  _id: "michael.goulbourn@guinnessworldrecords.com",
  alertFrequency: [
    {
      number: 1,
      type: "days"
    }
  ],
  alertOptions: [
    {
      checked: true,
      name: "Send alert when trade mark expires",
      functionName: "sendExpiredAlerts",
      type: "one-off"
    },
    {
      checked: true,
      name: "Send reminders for expiry",
      functionName: "sendExpiryAlerts",
      type: "recurring"
    },
    {
      checked: true,
      name: "Send alert when trade mark altered (edited, deleted, added)",
      functionName: "sendAlertOnChange",
      type: "one-off"
    }
  ],
  email: "michael.goulbourn@guinnessworldrecords.com",
  isAdmin: true,
  username: "MICHAEL.GOULBOURN@GUINNESSWORLDRECORDS.COM"
}];

var trademarks = [
    {
  entity: "ACME INC",
  portfolio: "ACME INC",
  mark: "ACME",
  status: "Registered",
  country: {
    coordinates: [
      -34,
      -64
    ],
    alpha2: "AR",
    alpha3: "ARG",
    name: "Argentina"
  },
  alpha3: "ARG",
  filingDate: {
    stringDate: "1/7/2011"
  },
  registrationDate: {
    stringDate: "3/22/2013"
  },
  expiryDate: {
    stringDate: "9/20/2014"
  },
  applicationNumber: "3060238",
  registrationNumber: "2559727",
  _id: "53c8e75f730766d56dd6ab9f",
  active: true,
  classes: [
    16
  ],
  __v: 0
}

];
