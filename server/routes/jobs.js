var admin = require('../config/sendgrid'),
    sendgrid = require('sendgrid')(admin.username, admin.password),
    moment = require('moment'),
    mustache = require('mustache'),
    fs = require('fs'),
    path = require('path'),
    helper = require('./helper'),
    async = require('async'),
    user = require('./users')

module.exports = {
    sendExpiryAlerts: function(admins, trademarks, fn) {
        async.forEach(admins, function(admin, callback) {
            async.forEach(admin.alertFrequency, function(f, callback) {
                async.forEach(trademarks, function(tm, callback) {
                    var expiry = moment(tm.expiryDate.stringDate, 'MM/DD/YYYY'),
                        revised = expiry.subtract(f.type, f.number),
                        now = moment();
                    if (revised.diff(now, 'days') === 0 && admin.entity === tm.entity) {
                        var fileLocation = path.resolve(__dirname, '../email-templates/expiry-reminder.html')
                        returnHtml(tm, fileLocation, function(err, html) {
                            sendEmail(admin.email, "Trade mark portfolio alert", html, function() {
                                //callback();
                            })
                        })
                    }
                    callback();
                }, function(err) {
                    callback();
                })

            }, function(err) {
                callback();
            })
        }, function(err) {
            fn();
        });
    },

    sendExpiredAlerts: function(admins, trademarks, fn){
        async.forEach(admins, function(admin, callback) {
            async.forEach(trademarks, function(tm, callback) {
                var expiry = moment(tm.expiryDate.stringDate, 'MM/DD/YYYY'),
                    now = moment();
                if (expiry.diff(now, 'days') === 0){
                    var fileLocation = path.resolve(__dirname, '../email-templates/expired-trademark.html')
                    returnHtml(tm, '../email-templates/expired-trademark.html', function(err, html){
                         sendEmail(admin.email, "Trade mark portfolio alert", html, function(err, success){
                            //callback();
                       })
                    })
                }
                callback();
            }, function (err) {
                if (err){ console.log(err)}
                callback();
            })

        }, function (err) {
            if (err){ console.log(err)}
            fn();
        })
    },
 	
    sendAlertOnChange: function (trademark, event, fn) {
        user.getAllAdmins(function(err, admins){ 
            async.forEach(admins, function (admin, callback) {
                async.forEach(admin.alertOptions, function (job, callback) {
                    if (job.functionName === "sendAlertOnChange" && job.checked) {
                        trademark.event = event;
                        var fileLocation = path.resolve(__dirname, '../email-templates/updated-trademark.html');
                        returnHtml(trademark, fileLocation, function(err, html){
                            
                            sendEmail(admin.email, "Trade mark portfolio alert", html, function () {
                                //callback();
                             })
                        })
                    }
                    callback();
                }, function(err){
                    callback();
                })
            }, function(err){
                fn()
            })
        })
    }
}

function returnHtml(obj, path, fn) {
    fs.readFile(path, function (err, contents) {
        if (err) { console.log(err) }
        var compiled = mustache.render(contents.toString(), obj);
        return fn(null, compiled);
    });
}

function sendEmail(addressee, subject, html, fn) {
    sendgrid.send({
        to: addressee,
        from: 'michael.goulbourn@guinnessworldrecords.com',
        subject: subject,
        html: html
    }, function(err, json) {
           fn(null, json);
    })
}
