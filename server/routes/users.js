
var admin = require('../config/sendgrid')
, User = require('../models/userSchema')
, entities = require('./entities')
, passwordReset = require('../models/passwordResetSchema')
, sendgrid = require('sendgrid')(admin.username, admin.password)
, mustache = require('mustache')
, fs = require('fs')
, path = require('path')
, bcrypt = require('bcrypt');

exports.anyUsers = function(req, res){
    User.find({}, function(err, users){
        if (users.length != 0){ res.status(200).send(); }
        else { res.status(401).send(); }
    });
} 

exports.getAllAdmins = function(fn){
    user.find({ isAdmin: true }).lean().exec(function(err, admins){
         fn(null, admins);
    })
}

exports.isUser = function(req, res){
     if (req.session.user){ res.status(200).send()}
      else { res.status(401).send({message: "Must be signed in"}) }
    }

exports.isAdmin = function(req, res){
    if ( req.session.admin){ res.status(200).send() }
    else { res.status(401).send({message: "Must be admin"} )}
}

exports.getUser = function(req, res){
    if (req.session.user){
         res.json(req.session.userDetails);
    }
    else {
        res.status(401).send();
    }
}

function removeId(obj){
   delete obj._id;
   return obj;
}

exports.updateAlert = function(req, res){
    User.findOneAndUpdate({_id: req.session.userDetails._id}, removeId(req.body), function(err, user){
         req.session.userDetails = user;
         res.json(user);
    })
}

exports.logIn = function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
       if (user) {
         req.session.regenerate(function(){
            req.session.user = true;
            req.session.userDetails = user;
            if (user.isAdmin){
                req.session.admin = true;
            }
            res.status(200).send();
         })
       }
       else { res.status(401).send({message: "Incorrect username or password"})}
    })
}
    
exports.addUser = function(req, res) {
    User.findOne({username: req.body.username.toUpperCase()}, function(err, user) {
        if (user) { res.status(401).send({message: 'Apologies - username already taken'}); return;}
        hashPasswordAndAddUser(req.body, function(err, user){
            req.session.regenerate(function(){
                  req.session.user = true;
                  req.session.userDetails = user;
                  if (user.isAdmin){
                     req.session.admin = true;
                  }
                  res.status(200).send();
                });
            });
       })
   }

exports.updatePassword = function(req, res){
     var id = req.session.userDetails._id;
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
                  returnHtml(reset, fileLocation, function(err, html){
                       sendEmail(reset.email, "Password reset", html, function(err, json){
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
    req.session.destroy(function(){
    res.status(200).send();
  });
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
                req.session.regenerate(function(){
                      req.session.user = true;
                      req.session.userDetails = user;
                      if (user.isAdmin){
                         req.session.admin = true;
                      }
                      res.status(200).send();
                    });
                });
           })
       })
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

function returnHtml(obj, path, fn) {
    fs.readFile(path, function (err, contents) {
        if (err) { console.log(err) }
        var compiled = mustache.render(contents.toString(), obj);
        return fn(null, compiled);
    });
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
    new User({_id: obj.username,
            username: obj.username.toUpperCase(),
            email: obj.username,
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

