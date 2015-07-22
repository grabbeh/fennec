
var email = require('./email')
  , moment = require('moment')
  , html = require('./html')
  , fs = require('fs')
  , path = require('path')
  , helper = require('./helper')
  , notification = require('./notification')
  , async = require('async')
  , user = require('./users')

module.exports = {
    sendExpiryAlerts: function(admin, trademarks, fn) {
        async.forEach(admin.alertFrequency, function(f, callback) {
            async.forEach(trademarks, function(tm, callback) {
                var expiry = moment(tm.expiryDate.stringDate, 'MM/DD/YYYY'),
                    revised = expiry.subtract(f.type, f.number).format('MM/DD/YYYY'),
                    now = moment().format("MM/DD/YYYY");
                if (revised === now && admin.entity === tm.entity) {
                    async.auto({
                        sendEmail: function(cb, results){
                            var fileLocation = path.resolve(__dirname, '../email-templates/expiry-reminder.html');
                            html.returnHtml(tm, fileLocation, function(err, html) {
                                email.sendEmail(admin.email, "Trade mark portfolio alert", html, cb)
                            })
                        },
                        addNotification: function(cb, results){
                            notification.addNotification(tm, admin._id, { expiringIn: f, expiryDate: tm.expiryDate.stringDate, type: 'Trademark due to expire' }, cb)
                         }
                       }, function(err, results){
                            if (err) { console.log(err) }
                    })  
                }
                callback();
            }, function(err) {
                callback();
            })

        }, function(err) {
            fn()
        })
    },

    sendExpiredAlerts: function(admins, trademarks, fn){
        async.forEach(admins, function(admin, callback) {
            async.forEach(trademarks, function(tm, callback) {
                var expiry = moment(tm.expiryDate.stringDate, 'MM/DD/YYYY'),
                    now = moment();
                if (expiry.diff(now, 'days') === 0 && admin.entity === tm.entity){
                    var fileLocation = path.resolve(__dirname, '../email-templates/expired-trademark.html')
                    html.returnHtml(tm, '../email-templates/expired-trademark.html', function(err, html){
                         email.sendEmail(admin.email, "Trade mark portfolio alert", html, function(err, success){
                       })
                    })
                }
                callback();
            }, function (err) {
                callback();
            })

        }, function (err) {
            fn();
        })
    },
 	
    sendAlertOnChange: function (trademark, event, fn) {
        user.getAllAdmins(function(err, admins){ 
            async.forEach(admins, function (admin, callback) {
                async.forEach(admin.alertOptions, function (job, callback) {
                    if (job.functionName === "sendAlertOnChange" && job.checked && admin.entity === trademark.entity) {
                        trademark.event = event;
                        var fileLocation = path.resolve(__dirname, '../email-templates/updated-trademark.html');
                        html.returnHtml(trademark, fileLocation, function(err, html){
                            email.sendEmail(admin.email, "Trade mark portfolio alert", html, function () {
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

