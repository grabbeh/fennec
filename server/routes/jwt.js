var jwt = require('jsonwebtoken')
, secret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
   var payload = {};
   payload._id = user._id;
   payload.entity = user.entity;
   payload.isAdmin = user.isAdmin;
   var t = jwt.sign(payload, secret);
   return fn(null, t);
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, secret,  function(err, payload){
        return fn(null, payload);  
   });
}
