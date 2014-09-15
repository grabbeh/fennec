var jwt = require('jsonwebtoken')
, secret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
    var payload = {};
   payload._id = user._id;
   payload.entity = user.entity;
   payload.isAdmin = user.isAdmin;
    var token = jwt.sign(payload, secret);
    return fn(null, token);
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, jwtSecret.secret, {}, function(err, payload){
        return fn(null, payload);  
   });
}



    
