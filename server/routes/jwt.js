var jwt = require('jsonwebtoken')
, secret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
   var payload = {};
   payload._id = user._id;
   payload.entity = user.entity;
   payload.isAdmin = user.isAdmin;
   console.log(payload);
   console.log(secret);
   jwt.sign(payload, secret, {}, function(err, token){
   	console.log(err);
   	console.log(token);
    	if (err) { console.log("Error with token creation"); console.log(err); return fn(err)}
    	console.log("Token returned");
    	console.log(token);
    	return fn(null, token);
    });
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, secret, {}, function(err, payload){
        return fn(null, payload);  
   });
}
