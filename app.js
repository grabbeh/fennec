var express = require('express')
  , bodyParser = require('body-parser')
  , serveStatic = require('serve-static')
  , mongoose = require('mongoose')
  , expressJwt = require('express-jwt')
  , secret = require('./server/config/jwt-secret')
  , https = require('https')
  , http = require('http')
  , fs = require('fs')
  , multipart = require('connect-multiparty')
  , db = require('./server/config/paid-db')
  , job = require('./server/routes/agenda')
  , app = express();

app.use('/api', expressJwt({secret: secret }));

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use(bodyParser());
app.use(multipart());
app.use(serveStatic(__dirname + '/client'));

mongoose.connect(db, function(err){
    if (err) { console.log(err); throw new Error(err.stack);}
  });

// Agenda

job.setUpAgenda(db);

// middleware

function x(req, res, next) {
  if (req.user) { next(); } 
  else { res.status(401).send(); }
}

// Routes

require('./routes')(app, x);

/*
var options = {
  key: fs.readFileSync('./server/config/domain.pem'),
  cert: fs.readFileSync('./server/config/main.pem'),
  ca: [fs.readFileSync('./server/config/intermediate.pem')]
};*/

// Development port

http.createServer(app).listen(2002);

// Production port

//https.createServer(options, app).listen(2003);


