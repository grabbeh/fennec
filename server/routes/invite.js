var Invite = require('../models/inviteSchema')
, async = require('async')
, email = require('./email')
, html = require('./html')

exports.createInvite = function(req, res){
    var o = {};
    o.email = req.body.email;
    o.inviter = req.user._id;
    o.entity = req.user.entity;
    async.auto({
        invite: function(cb, results){
            addInvite(o, cb)
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

function addInvite(o, fn){
    new Invite({
      email: o.email,
      entity: o.entity,
      inviter: o.inviter
    }).save(function(err, invite){
        return fn(null, invite)
    })
}
