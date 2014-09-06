var admin = require('../config/sendgrid');
	sendgrid = require('sendgrid')(admin.username, admin.password);

exports.sendEmail = function(addressee, subject, html, fn) {
    sendgrid.send({
        to: addressee,
        from: 'no-reply@tryfennec.com',
        subject: subject,
        html: html
    }, function(err, json) {
    		if (err) { console.log(err) }
           fn(null, json);
    })
}

