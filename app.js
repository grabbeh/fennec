var express = require('express')
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, serveStatic = require('serve-static')
, mongoose = require('mongoose')

, expressJwt = require('express-jwt')
, jwtSecret = require('./server/config/jwt-secret')

, https = require('https')
, http = require('http')
, fs = require('fs')

, multipart = require('connect-multiparty')

, db = require('./server/config/paid-db')
, world = require('./server/routes/world')
, country = require('./server/routes/country')
, group = require('./server/routes/group')
, main = require('./server/routes/main')
, user = require('./server/routes/users')
, helper = require('./server/routes/helper')
, image = require('./server/routes/images')
, expiry = require('./server/routes/expiry')
, job = require('./server/routes/agenda')
, spreadsheet = require('./server/routes/excel-process')
, contact = require('./server/routes/contact')

, app = express();

app.use('/api', expressJwt({secret: jwtSecret.secret }));

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use(bodyParser());
app.use(multipart());
app.use(serveStatic(__dirname + '/client'));

var database = 'mongodb://' 
  + db.user + ':' 
  + db.pass + '@' 
  + db.host + ':' 
  + db.port + '/' 
  + db.name

mongoose.connect(database, function(err){
    if (err) { console.log(err); throw new (err.stack);}
  });

// Agenda

job.setUpAgenda(database);

// middleware

function x(req, res, next) {
  if (req.user) { next(); } 
  else { res.redirect('/login'); }
}

// Routes

app.get('/', function(req, res){
  res.sendfile(__dirname + '/client/views/index.html')
});

app.get('/download/downloadTrademarks', main.downloadTrademarks);

// Elasticsearch 
// 
app.post('/api/search', x, main.search);

app.get('/api/searchTrademarks/:portfolio', x, main.searchTrademarks);

// Country data (ISO, coordinates etc)

app.get('/api/countryData', x, world.countryData);

// Provide geojson for group of marks

app.get('/api/world/:portfolio/:group', x, world.worldForGroup);

// Filtered world on basis of given list of marks

app.post('/api/world/:portfolio', x, world.worldForListOfMarks);

// Country-limited trade marks

app.get('/api/country/:portfolio/:country', x, country.marksForCountry);
app.post('/api/country/:portfolio/:country', x, country.filterMarksForCountry);

// Get group of marks

app.get('/api/trademarks/:portfolio/:group', x, group.groupOfMarks);

// Edit individual trade marks

app.get('/api/trademark/:id', x, main.getTrademark);
app.post('/api/trademark', x, main.addTrademark);
app.put('/api/trademark/:id', x, main.amendTrademark);
app.delete('/api/trademark/:id', x, main.deleteTrademark);

// List of marks

app.get('/api/listOfMarks/:portfolio', x, group.listOfMarks);

// Edit portfolio

app.post('/api/editGroup/:portfolio/:mark', x, group.editGroupOfMarks);
app.post('/api/addLogoToGroup/:portfolio/:mark', x, group.addLogoToGroup);
app.post('/api/editMarksInCountry/:portfolio', x, country.editMarksInCountry);

// Expiry dates

app.get('/api/expirydates/:portfolio', x, expiry.expiriesForGroup);
app.get('/api/expiriesForYear/:portfolio', x, expiry.expiriesForYear);

// Users

app.post('/api/addUser', user.addUser);
app.post('/server/login', user.logIn);
app.get('/api/isAdmin', user.isAdmin);
app.get('/api/isUser', user.isUser);
app.get('/api/getUser', user.getUser);
app.get('/api/logout', user.logout);

app.post('/api/updateUser', user.updateUser);

// Passwords

app.post('/api/updatePassword', user.updatePassword);
app.post('/server/requestPasswordReset', user.requestPasswordReset);
app.post('/server/passwordReset/:id', user.resetPassword);

// Account creation

app.post('/api/createAccount', user.createAccount);

// Spreadsheet upload

app.post('/api/spreadsheet', x, spreadsheet.processExcel);

// Image upload

app.post('/api/upload', x, image.uploadImage);

// Message sending 

app.post('/server/processMessage', contact.processMessage)

app.get('*', function(req, res){
  res.sendfile(__dirname + '/client/views/index.html');
});
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


