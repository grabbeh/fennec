
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
    notification = require('./notification')
    path = require("path")

exports.setUpAgenda = function(db){
    agenda
      .database(db)
      .processEvery('60 minutes');
    
    agenda.define('check for alerts', function(job, done) {
          async.parallel([
                async.apply(user.getAllAdmins),
                async.apply(helper.getAllTrademarks)
            ], function(err, results){
              if (err) { console.log(err);}
                executeJobs(results[0], results[1], function(){
                    done();
                });
            });
        });
    

    agenda.define('email me', function(job, done){
        sendEmail("mbg@outlook.com", "<p>Hello! 24 hour job</p>", function(){
            done();
        });
    })
/*
    agenda.define('test', function(job, done){
        testJob(admins, trademarks, function(){
            console.log("job completed");
            done();
        });
    })
*/
    //agenda.now('test');
    //agenda.start();

    agenda.every('1440 minutes', ['check for alerts', 'email me']);
    //agenda.every('10 seconds', 'console');
    agenda.start();
}

function executeJobs(admins, trademarks, fn){
    async.forEach(admins, function(admin, callback){
    	async.forEach(admin.alertOptions, function(job, callback){
            if (job.checked && job.type === "recurring"){
              	jobs[job.functionName](admins, trademarks, function(){
                    
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

function testJob(admins, trademarks, fn) {
    async.forEach(admins, function (admin, callback) {
        async.forEach(admin.alertFrequency, function (f, callback) {
            async.forEach(trademarks, function (tm, callback) {
                var expiry = moment(tm.expiryDate.stringDate, 'MM/DD/YYYY'),
                    revised = expiry.subtract(f.type, f.number),
                    now = moment();
                    console.log(revised.diff(now, 'days'))
                    console.log("Trademark loop")
                if (revised.diff(now, 'days') === 0) {
                        console.log("Expiry alert")
                        async.auto({
                            sendEmail: function(cb, results){
                                var fileLocation = path.resolve(__dirname, '../email-templates/expiry-reminder.html');
                                html.returnHtml(tm, fileLocation, function(err, html) {
                                    console.log("Alert triggered")
                                    email.sendEmail(admin.email, "Trade mark portfolio alert", html, cb);
                                })
                            },
                            addNotification: function(cb, results){
                                console.log("Notification triggered")
                                notification.addNotification(tm, { expiringIn: f, expiryDate: tm.expiryDate.stringDate, type: 'Trademark due to expire' }, cb)
                             }
                           }, function(err, results){
                             if (err) { console.log(err) }

                        })  
                    }
            }, function (err) {
                console.log("Trademark loop completed")
                callback();
            })

        }, function (err) {
            console.log("alert Frequency loop completed")
            callback();
        })
    }, function (err) {
        console.log("admins loop completed")
        fn();
    });
}

function testTwoJob(admins, trademark, event, fn) {
        async.forEach(admins, function (admin, callback) {
            async.forEach(admin.alertOptions, function (job, callback) {
                if (job.functionName === "sendAlertOnChange" && job.checked) {
                    console.log("Job triggered");
                    trademark.event = event;
                    var fileLocation = path.resolve(__dirname, '../email-templates/updated-trademark.html');
                    html.returnHtml(trademark, fileLocation, function(err, html){
                        email.sendEmail(admin.email, html, function () {
                            //callback();
                         });
                    });
                }
                callback();
            }, function(err){
                console.log("Loop through options completed")
                callback();
            });
        }, function(err){
            console.log("Loop through admins completed")
            fn();
        });
    }

var admins = [{
  __v: 0,
  _id: "michael.goulbourn@guinnessworldrecords.com",
  alertFrequency: [
    {
      number: 1,
      type: "days"
    },
    {
      number: 2,
      type: 'days'
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
      type: "one-off"
    },
    {
      checked: true,
      name: "Send alert when trade mark altered (edited, deleted, added)",
      functionName: "sendAlertOnChange",
      type: "recurring"
    }
  ],
  email: "mbg@outlook.com",
  isAdmin: true,
  username: "MICHAEL.GOULBOURN@GUINNESSWORLDRECORDS.COM"
}];


var trademarks = [
     {
  entity: "GWR",
  portfolio: "GWR",
  _id: "FIRST ID",
  mark: "GUINNESS WORLD RECORDS",
  status: "Registered",
  country: {
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
    stringDate: "9/7/2014"
  },
  applicationNumber: "3060238",
  registrationNumber: "2559727",
  active: true,
  classes: [
    16
  ],
  __v: 0
}/*,
{
  entity: "GWR",
  portfolio: "GWR",
  _id: "SECOND_ID",
  mark: "GUINNESS WORLD RECORDS",
  status: "Registered",
  country: {
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
    stringDate: "9/7/2014"
  },
  applicationNumber: "3060238",
  registrationNumber: "2559727",
  active: true,
  classes: [
    16
  ],
  __v: 0
}*/

];
