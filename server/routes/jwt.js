var jwt = require('jsonwebtoken')
, jwtSecret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
    var token = jwt.sign(user, jwtSecret.secret);
    return fn(null, token);
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, secret.secret, {}, function(err, payload){
        if (err){ console.log(err)}
        return fn(null, payload);  
   });
}


    
