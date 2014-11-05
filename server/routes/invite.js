var Invite = require('../models/inviteSchema')
, async = require('async')
, email = require('./email')
, html = require('./html')
, user = require('./user')

exports.sendInvite = function(req, res){
    var o = {};
    o.email = req.body.email;
    o.admin = req.body.checked;
    o.inviter = req.user._id;
    o.entity = req.user.entity;
    async.auto({
        existingUser: function(cb, results){
            user.existingUser(o.email, cb);
        },
        invite: ['existingUser', function(cb, results){
            addInvite(o, cb)
        ]},
        html: ['invite', function(cb, results){
            var fileLocation = path.resolve(__dirname, '../email-templates/invite.html');
            html.returnHtml(results.invite, fileLocation, cb);
        }],
        sendEmail: ['html', function(cb, results){
            email.sendEmail(id, "Invite to Fennec", results.html, cb)
        }]
        }, function(err, results){
            if (err)
                res.json({error: "User already exists"})
            else 
                res.json({success: "Invite sent"})
    })     
}

function addInvite(o, fn){
    new Invite({
      email: o.email,
      entity: o.entity,
      inviter: o.inviter,
      admin: o.admin
    }).save(function(err, invite){
        return fn(null, invite)
    })
}

exports.getInvite = function(req, res){
    Invite.findOne({ _id: req.params.id }).lean().exec(function(err, invite){
        res.json(invite);
    })
}

exports.acceptInvite = function(req, res){
    Invite.findOne({ _id: req.params.id }).lean().exec(function(err, invite){
        invite.password = req.body.password;
        invite.isAdmin = invite.admin;
        user.createAccountFromInvite(invite, function(err, token){
            res.status(200).json(token);  
        })
    })
}
