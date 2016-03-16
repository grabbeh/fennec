var express = require('express')
    , app = express()
    , bodyParser = require('body-parser')
    , serveStatic = require('serve-static')
    , mongoose = require('mongoose')
    , expressJwt = require('express-jwt')
    , https = require('https')
    , http = require('http')
    , multipart = require('connect-multiparty')
    , secret = require('./server/config/jwt-secret')
    , ssl = require('./server/config/ssl')
    , db = require('./server/config/paid-db')
    , job = require('./server/routes/agenda');

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

mongoose.createConnection(db, {}, function(err, success){
    if (err) 
        console.log(err);
    else 
        console.log(success);
});

// Agenda
job.setUpAgenda(db);

// Routes
require('./server/routes')(app);

// Development port
http.createServer(app).listen(2002);

// Production port
//https.createServer(ssl, app).listen(2003);


