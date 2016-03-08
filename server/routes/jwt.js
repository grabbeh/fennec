var jwt = require('jsonwebtoken')
, secret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
	console.log("Create token fn called")
   console.log(user);
   
    var payload = {};
   payload._id = user._id;
   payload.entity = user.entity;
   payload.isAdmin = user.isAdmin;
    var token = jwt.sign(payload, secret, {}, function(err, token){
    	if (err) { return fn(err)}
    	return fn(null, token);
    });
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, secret, {}, function(err, payload){
        return fn(null, payload);  
   });
}
