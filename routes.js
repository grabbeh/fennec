var world = require('./server/routes/world')
, country = require('./server/routes/country')
, group = require('./server/routes/group')
, main = require('./server/routes/main')
, user = require('./server/routes/users')
, helper = require('./server/routes/helper')
, image = require('./server/routes/images')
, expiry = require('./server/routes/expiry')
, activity = require('./server/routes/activity')
, notification = require('./server/routes/notification')
, spreadsheet = require('./server/routes/excel-process')
, contact = require('./server/routes/contact');

module.exports = function(app, x){

	app.get('/', function(req, res){
	  res.sendfile(__dirname + '/client/views/index.html')
	});

	app.get('/download/downloadTrademarks', main.downloadTrademarks);

	// Elasticsearch  
	app.post('/api/search', x, main.search);

	app.get('/api/searchTrademarks/:portfolio', x, main.searchTrademarks);

	// Country data (ISO, coordinates etc)
	app.get('/api/countryData', x, world.countryData);

	// Provide geojson for group of marks
	app.get('/api/world/:portfolio/:group', x, world.worldForGroup);

	// Filtered world on basis of given list of marks
	app.post('/api/world/:portfolio', x, world.worldForListOfMarks);

	// world on basis of country
	app.get('/api/world/:portfolio', x, world.worldForCountry);

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

	// Retrieve favourite marks
	app.get('/api/favourites/:portfolio', x, group.favourites);

	// Edit portfolio
	app.post('/api/editGroup/:portfolio/:mark', x, group.editGroupOfMarks);
	app.post('/api/addLogoToGroup/:portfolio/:mark', x, group.addLogoToGroup);
	app.post('/api/editMarksInCountry/:portfolio', x, country.editMarksInCountry);

	// Expiry dates
	app.get('/api/expirydates/:portfolio', x, expiry.expiriesForGroup);
	app.get('/api/expirydates/:portfolio/:country', x, expiry.expiriesForCountry);
	app.get('/api/expiriesForYear/:portfolio', x, expiry.expiriesForYear);

	// Notifications
	app.get('/api/notifications', notification.unreadNotifications);
	app.post('/api/notifications', notification.updateNotification);

	// Activities
	app.get('/api/activities/:portfolio', activity.findActivities);

	// Users
	app.post('/api/addUser', user.addUser);
	app.post('/server/login', user.logIn);
	app.get('/api/isAdmin', user.isAdmin);
	app.get('/api/isUser', user.isUser);
	app.get('/api/getUser', user.getUser);

	app.put('/api/users/:id', user.updateUser);
	app.get('/api/users', user.allUsers);
	app.del('/api/users/:id', user.deleteUser);


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

	// Serve .html file if route not matched
	app.get('*', function(req, res){
	  res.sendfile(__dirname + '/client/views/index.html');
	});
}
