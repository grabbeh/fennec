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
, main = require('./server/routes/main')
, user = require('./server/routes/users')
, helper = require('./server/routes/helper')
, image = require('./server/routes/images')
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

app.get('/download/downloadTrademarks/:portfolio', main.downloadTrademarks);

// Elasticsearch 
// 
app.post('/api/search', x, main.search);

// Country data (ISO, coordinates etc)

app.get('/api/countrydata', x, main.countryData);
app.get('/api/filteredCountryData/:portfolio', x, main.filteredCountryData);

// Filtered world on basis of given list of marks

app.post('/api/world/:portfolio', x, main.getFilteredWorld);

// Provide geojson for whole portfolio

app.get('/api/worldgroup/:portfolio/:group', x, main.getWorldGroup);

// Country-limited trade marks

app.get('/api/country/:portfolio/:country', x, main.getCountry);
app.post('/api/country/:portfolio/:country', x, main.filterCountry);

// Get group of marks

app.get('/api/trademarks/:portfolio/:group', x, main.getGroup);

// Edit individual trade marks

app.get('/api/trademark/:id', x, main.getTrademark);
app.post('/api/trademark', x, main.addTrademark);
app.put('/api/trademark/:id', x, main.amendTrademark);
app.delete('/api/trademark/:id', x, main.deleteTrademark);

// List of marks

app.get('/api/listOfMarks/:portfolio/:country', x, main.filterListOfMarks)
app.get('/api/listOfMarks/:portfolio', x, main.getListOfMarks);

// Edit portfolio

app.post('/api/editGroup/:portfolio/:mark', x, main.editGroupOfMarks);
app.post('/api/addLogoToGroup/:portfolio/:mark', x, main.addLogoToGroup);
app.post('/api/editMarksInCountry/:portfolio/:alpha3', x, main.editMarksInCountry);

// Expiry dates

app.get('/api/expirydates/:portfolio/:group', x, main.provideExpiryDatesForGroup);
app.get('/api/expirydates/:portfolio', x, main.provideExpiryDates);

app.post('/api/expiriesForYear/:portfolio', x, main.getExpiriesForYear);

// Users

app.post('/api/addUser', user.addUser);
app.post('/auth/login', user.logIn);
app.get('/api/isAdmin', user.isAdmin);
app.get('/api/isUser', user.isUser);
app.get('/api/getUser', user.getUser);
app.get('/api/logout', user.logout);

app.post('/api/updateUser', user.updateUser);

// Passwords

app.post('/api/updatePassword', user.updatePassword);
app.post('/api/requestPasswordReset', user.requestPasswordReset);
app.post('/api/passwordReset/:id', user.resetPassword);

// Account creation

app.post('/api/createAccount', user.createAccount);

// Spreadsheet upload

app.post('/api/spreadsheet', spreadsheet.processExcel);

// Image upload

app.post('/api/upload', image.uploadImage);

// Message sending 

app.post('/api/processMessage', contact.processMessage)

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


