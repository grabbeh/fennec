
var jwt = require('./jwt')
, async = require('async')
, User = require('../models/userSchema')
, entities = require('./entities')
, passwordReset = require('../models/passwordResetSchema')
, email = require('./email')
, html = require('./html')
, fs = require('fs')
, path = require('path')
, helper = require('./helper')
, entity = require('./entities')
, bcrypt = require('bcrypt');

exports.deleteUser = function(req, res){
    User.findOneAndRemove({ _id: req.params.id }, function(err, user){
        res.json("User removed");
    })
}

exports.allUsers = function(req, res){
  User.find({ entity: req.user.entity}).lean().exec(function(err, users){
      res.json(users);
  })
}

exports.getAllAdmins = function(fn){
    User.find({ isAdmin: true }).lean().exec(function(err, admins){
        fn(null, admins);
    });
}

exports.isUser = function(req, res){
    if (req.user)
        res.status(200).send()
    else
        res.status(401).send({message: "Must be signed in"}) 
    }

exports.isAdmin = function(req, res){
    if ( req.user.isAdmin){ res.status(200).send() }
    else { res.status(401).send({message: "Must be admin"} )}
}

exports.getUser = function(req, res){
    if (req.user){
        helper.findUser(req.user._id, function(err, user){
            res.json(user);
        })
    }
    else 
        res.status(401).send();
}

exports.updateUser = function(req, res){
    User.findOneAndUpdate({_id: req.params.id}, helper.removeId(req.body), function(err, user){
         req.user = user;
         res.json(user);
    })
}

exports.logIn = function(req, res){
    console.log("Login route called")
    authenticate(req.body.email, req.body.password, function(err, user){
        console.log("Auth route called");
        
       if (user) {
           console.log("User returned")
           jwt.createToken(user, function(err, token){
               if (err) { console.log(err); console.log("Token error") }
               else {
                   res.status(200).send({ token: token })
               };  
           })
       }
       else { console.log(err); console.log("No user returned error"); console.log(err); res.status(401).send({message: "Incorrect username or password"})}
    })
}

exports.createAccountFromInvite = function(o, fn){
    async.auto({
        user: function(cb, results){
           addUser(o.entity, o.email.toLowerCase(), o, cb);
        },
        token: ['user', function(cb, results){
            jwt.createToken(results.user, cb)
        }]
    }, function(err, results){
        if (err) return fn(err);
        else
            return fn(null, results.token)
    })
}
  
function addUser(entity, id, o, fn)  {
    entities.getEntity(entity, function(err, entity){
        o.portfolios = entity.portfolios;
        User.findOne({_id: id, entity: entity }, function(err, user) {
        if (user) { return fn(err); }
        hashPasswordAndAddUser(o, function(err, user){
            if (err)
                return fn(err);
            else 
                return fn(null, user);
            });
       })
    })
}

exports.existingUser = function(id, fn){
    User.findOne({_id: id}, function(err, user){
        if (user)
            return fn(new Error("Existing user"))
        else 
            return fn(null, true);
    })
}

exports.updatePassword = function(req, res){
     var id = req.user._id.toLowerCase()
     , old = req.body.oldPW
     , nnew = req.body.newPW;
     authenticate(id, old, function(err, user){
          if (err || !user) 
              res.status(401).send({ message: "Current password is wrong"})
          else {
              bcrypt.compare(nnew, user.hash, function(err, response){
                     if (response) 
                        res.status(401).send({ message: "New password and old password can't be the same"}) 
                     else {
                        hashPasswordAndUpdateUser(id, nnew, function(err, user){
                            res.json({message: "Password updated"})
                        })
                    }  
              })
          }
     })
}

function newPasswordReset(id, fn){
    new passwordReset({
        email: id
    }).save(function(err, reset){
        fn(null, reset);
    });
}

exports.requestPasswordReset = function(req, res){
    var id = req.body.email.toLowerCase();
    async.auto({
        existingUser: function(cb, results){
            User.findOne({_id: id}, cb)
        },
        passwordReset: function(cb, results){
            newPasswordReset(id, cb);
        },
        html: ['passwordReset', function(cb, results){
            var fileLocation = path.resolve(__dirname, '../email-templates/password-reset.html');
            html.returnHtml(results.passwordReset, fileLocation, cb);
        }],
        sendEmail: ['html', function(cb, results){
            email.sendEmail(id, "Password reset", results.html, cb)
        }]
    }, function(err, results){
        res.status(200).send({ success: "If the provided email is in our database, you will have been sent an email allowing you to reset your password"})
    })
}

exports.resetPassword = function(req, res){
    passwordReset.findOne({ _id: req.params.id }, function(err, reset){
        if (reset){
            hashPasswordAndUpdateUser(reset.email, req.body.newPassword, function(err, user){
                reset.remove(function(err, doc){
                    res.status(200).send({ message: "Password changed"})
                });
            })
        }
             
    })
}

exports.addPortfolioToUser = function(id, portfolio, fn){
    User.findOneAndUpdate({ _id: id}, { $addToSet: { portfolios: portfolio}}, function(err, user){
        if (err) { return fn(err)}
        else { return fn(null, true)}
    })
}

exports.createAccount = function(req, res) {
    var entity = req.body.entity
    ,   id = req.body.username.toLowerCase();
    async.auto({
        addEntity: function(cb, results){
            entities.saveEntity(entity, cb)
        },
        existingUser: function(cb, results){
            User.findOne({_id: id}, cb);
        },
        user: function(cb, results){
            hashPasswordAndAddUser(req.body, cb);
        },
        token: ['user', function(cb, results){
            jwt.createToken(results.user, cb)
        }]
    }, function(err, results){
        if (err) 
            res.status(401).send({ message: "Entity or username already taken"});
        else      
            res.status(200).json(results.token);  
    });
}

function authenticate(id, pass, fn) {
   User.findOne({_id: id }, function(err, user) {
       if (err || !user) { return fn(err)}; 
       bcrypt.compare(pass, user.hash, function(err, res){
         if (err || !res) { return fn(err) }
         else { return fn(null, user); }
        })
    })
 }

function hashPasswordAndAddUser(o, fn){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(o.password, salt, function(err, hash) {
            saveUser(o, hash, function(err, user){
                fn(null, user)
            });
        });
    });
}

function hashPasswordAndUpdateUser(id, nnew, fn){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(nnew, salt, function(err, hash) {
            updatePassword(id, hash, function(err, user){
                fn(null, user)
            });
        });
    });
}
    
function saveUser(obj, hash, fn){
    var isAdmin = obj.isAdmin || obj.checked;
    new User({_id: obj.email.toLowerCase(),
            email: obj.email,
            hash: hash,
            isAdmin: isAdmin,
            portfolios: obj.portfolios,
            entity: obj.entity
        }).save(fn);
  }

function updatePassword(id , hash, fn){
    User.findOneAndUpdate({ _id: id }, { hash: hash }, function(err, user){
        fn(null, user)
    })
  }

