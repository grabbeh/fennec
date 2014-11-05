var Invite = require('../models/inviteSchema')
, async = require('async')
, email = require('./email')
, html = require('./html')

exports.createInvite = function(req, res){
    var email = req.body.email;
    async.auto({
        invite: function(cb, results){
            addInvite(email, cb)
        },
        html: ['invite', function(cb, results){
            var fileLocation = path.resolve(__dirname, '../email-templates/invite.html');
            html.returnHtml(results.invite, fileLocation, cb);
        }],
        sendEmail: ['html', function(cb, results){
            email.sendEmail(id, "Invite to Fennec", results.html, cb)
        }]
        }, function(err, results){
            res.json("Invite sent")
    })     
}

function addInvite(email, fn){
    new Invite({
      email: email
    }).save(function(err, invite){
        return fn(null, invite)
    })
}
