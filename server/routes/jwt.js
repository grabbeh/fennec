var jwt = require('jsonwebtoken')
, jwtSecret = require('../config/jwt-secret')

exports.createToken = function(user, fn){
    var payload = {};
   payload._id = user._id;
   payload.entity = user.entity;
   payload.favourites = user.favourites;
   payload.isAdmin = user.isAdmin;
    var token = jwt.sign(payload, jwtSecret.secret);
    return fn(null, token);
}

exports.verifyToken = function(token, fn){
	jwt.verify(token, jwtSecret.secret, {}, function(err, payload){
        if (err){ console.log(err)}
        return fn(null, payload);  
   });
}

function url_base64_decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}


    
