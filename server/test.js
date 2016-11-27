
var jwt = require('jsonwebtoken');

jwt.sign({foo: 'bar'}, "Katie", {}, function(token){
    console.log("Complete");
    console.log(token);
});
