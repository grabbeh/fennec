
var admin = require('../config/sendgrid')
, jwt = require('./jwt')
, User = require('../models/userSchema')
, entities = require('./entities')
, passwordReset = require('../models/passwordResetSchema')
, email = require('./email')
, html = require('./html')
, fs = require('fs')
, path = require('path')
, bcrypt = require('bcrypt');

exports.getAllAdmins = function(fn){
    User.find({ isAdmin: true }).lean().exec(function(err, admins){
         fn(null, admins);
    });
}

exports.isUser = function(req, res){
     if (req.user){ res.status(200).send()}
      else { res.status(401).send({message: "Must be signed in"}) }
    }

exports.isAdmin = function(req, res){
    if ( req.user.isAdmin){ res.status(200).send() }
    else { res.status(401).send({message: "Must be admin"} )}
}

exports.getUser = function(req, res){
    if (req.user){
         res.json(req.user);
    }
    else {
        res.status(401).send();
    }
}

function removeId(obj){
   delete obj._id;
   return obj;
}

exports.updateUser = function(req, res){
    User.findOneAndUpdate({_id: req.user._id}, removeId(req.body), function(err, user){
         req.user = user;
         res.json(user);
    })
}

exports.logIn = function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
       if (user) {
           var payload = {};
           payload._id = user._id;
           payload.entity = user.entity;
           payload.favourites = user.favourites;
           payload.isAdmin = user.isAdmin;
           jwt.createToken(payload, function(err, token){
               res.status(200).send({token: token, user: user});  
           })
       }
       else { res.status(401).send({message: "Incorrect username or password"})}
    })
}
    
exports.addUser = function(req, res) {
    User.findOne({username: req.body.username.toUpperCase()}, function(err, user) {
        if (user) { res.status(401).send({message: 'Apologies - username already taken'}); return;}
        hashPasswordAndAddUser(req.body, function(err, user){
                 jwt.createToken(user, function(err, token){
                 res.status(200).json(token);  
                 })
            });
       })
   }

exports.updatePassword = function(req, res){
     var id = req.user._id;
     var old = req.body.oldPW;
     var nnew = req.body.newPW;
     authenticate(id, old, function(err, user){
          if (err || !user) { 
              res.status(401).send({ message: "Current password is wrong"})}
          else {
              bcrypt.compare(nnew, user.hash, function(err, response){
                     if (response){ res.status(401).send(
                        { message: "New password and old password can't be the same"}) } 
                     else {
                        hashPasswordAndUpdateUser(id, nnew, function(err, user){
                            res.json({message: "Password updated"})
                        })
                    }  
              })
          }
     })
}

exports.requestPasswordReset = function(req, res){
    User.findOne({ _id: req.body.email }, function(err, user){
          if (user){
              new passwordReset({
                  email: user._id 
              }).save(function(err, reset){
                  var fileLocation = path.resolve(__dirname, '../email-templates/password-reset.html');
                  html.returnHtml(reset, fileLocation, function(err, html){
                       email.sendEmail(reset.email, "Password reset", html, function(err, json){
                            res.status(200).send( { message: "Password reset email sent"})
                       })
                  })
              })
          }
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

exports.logout = function(req, res){
    req.user = false;
    res.status(200).send();
}

exports.addPortfolioToUser = function(id, portfolio, fn){
    User.findOneAndUpdate({ _id: id}, { $addToSet: { portfolios: portfolio}}, function(err, user){
        if (err) { return fn(err)}
        else { return fn(null, true)}
    })
}

exports.createAccount = function(req, res) {
    entities.saveEntity(req.body.entity, function(err, entity){
        if (err) { res.status(401).send({ message: 'Entity name already taken'}); return;}
        User.findOne({username: req.body.username.toUpperCase()}, function(err, user) {
            if (user) { res.status(401).send({message: 'Apologies - username already taken'}); return;}
            hashPasswordAndAddUser(req.body, function(err, user){
                jwt.createToken(user, function(err, token){
                      res.status(200).json(token);  
                   })
                });
           })
       })
   }

function authenticate(name, pass, fn) {
   User.findOne({_id: name}, function(err, user) {
       if (err || !user) {  return fn(err)}; 
       bcrypt.compare(pass, user.hash, function(err, res){
         if (err || !res) { return fn(err) }
         else { return fn(null, user); }
        })
    })
 }

function hashPasswordAndAddUser(body, fn){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(body.password, salt, function(err, hash) {
            saveUser(body, hash, function(err, user){
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
    new User({_id: obj.email,
            username: obj.email.toUpperCase(),
            email: obj.email,
            hash: hash,
            isAdmin: obj.checked,
            portfolios: obj.portfolios,
            entity: obj.entity
        }).save(fn);
  }

function updatePassword(id , hash, fn){
    User.findOneAndUpdate({ _id: id }, { hash: hash }, function(err, user){
         if (err) { fn(err) }
         fn(null, user)
    })
  }

