var world = require('./routes/world')
, path = require('path')
, country = require('./routes/country')
, group = require('./routes/group')
, main = require('./routes/main')
, user = require('./routes/users')
, image = require('./routes/images')
, expiry = require('./routes/expiry')
, activity = require('./routes/activity')
, notification = require('./routes/notification')
, spreadsheet = require('./routes/excel-process')
, contact = require('./routes/contact');

// middleware
function x(req, res, next) {
  if (req.user) { next(); } 
  else { res.status(401).send(); }
}

module.exports = function(app){

	app.get('/', function(req, res){
		res.sendfile('./client/index.html');
	});
	
	// Download trade marks based on query parameter "portfolio"
	app.get('/download/downloadTrademarks', main.downloadTrademarks);

	// Elasticsearch  
	app.post('/api/search', x, main.search);

	// General portfolio search function based on query parameters "portfolio", "group" and "country"
	app.get('/api/searchTrademarks/:portfolio', x, main.searchTrademarks);

	// Country data (ISO, coordinates etc) - optionally accepts query parameter in which case returns
	// country data limited to countries where there are trade marks
	app.get('/api/countryData', x, world.countryData);

	// Provide geojson for group of marks
	app.get('/api/world/:portfolio', x, world.worldForGroup);

	// Filtered world on basis of given list of marks
	app.post('/api/world/:portfolio', x, world.worldForListOfMarks);

	// Country-limited trade marks
	// Gets a list of all trade marks for a given portfolio in a given country (ISO code)
	app.get('/api/country/:portfolio/:country', x, country.marksForCountry);
	// In addition to the above, accepts list of trade marks and provides only those marks in a portfolio
	app.post('/api/country/:portfolio/:country', x, country.filterMarksForCountry);

	// Get group of marks
	app.get('/api/trademarks/:portfolio', x, group.groupOfMarks);

	// Edit individual trade marks
	app.get('/api/trademark/:id', x, main.getTrademark);
	app.post('/api/trademark', x, main.addTrademark);
	app.put('/api/trademark/:id', x, main.amendTrademark);
	app.delete('/api/trademark/:id', x, main.deleteTrademark);

	// Returns basic list of marks for portfolio - accepts optional query for ISO code in
	// which case returns list of marks for given country
	app.get('/api/list/:portfolio', x, group.listOfMarks);

	// Retrieve favourite marks
	app.get('/api/favourites/:portfolio', x, group.favourites);

	// Edit portfolio
	app.post('/api/editGroup/:portfolio/:mark', x, group.editGroupOfMarks);
	app.post('/api/addLogoToGroup/:portfolio/:mark', x, group.addLogoToGroup);
	app.post('/api/editMarksInCountry/:portfolio', x, country.editMarksInCountry);

	// Expiry dates
	// accepts query for group in addition to portfolio
	app.get('/api/expirydates/:portfolio', x, expiry.expiriesForGroup);
	app.get('/api/expirydates/:portfolio/:country', x, expiry.expiriesForCountry);
	app.get('/api/expiriesForYear/:portfolio', x, expiry.expiriesForYear);

	// Notifications
	app.get('/api/notifications', notification.unreadNotifications);
	app.post('/api/notifications', notification.updateNotification);

	// Activities
	app.get('/api/activities/:portfolio', activity.findActivities);

	// Users
	app.post('/server/login', user.logIn);

	// Routes for querying logged in user
	app.get('/api/isAdmin', user.isAdmin);
	app.get('/api/isUser', user.isUser);
	app.get('/api/user', user.getUser);

	app.post('/api/user', user.addUser);

	app.put('/api/users/:id', user.updateUser);
	app.get('/api/users', user.allUsers);
	app.del('/api/users/:id', user.deleteUser);
	
	app.post('/api/createAccount', user.createAccount);

	// Passwords (including reset)
	app.post('/api/updatePassword', user.updatePassword);
	app.post('/server/requestPasswordReset', user.requestPasswordReset);
	app.post('/server/passwordReset/:id', user.resetPassword);
	
	// Invite mechanism
	
	app.post('/api/sendInvite', invite.sendInvite);
	app.get('/server/invite/:id', invite.getInvite);
	app.post('/server/invite/:id', invite.acceptInvite);

	// Spreadsheet upload
	app.post('/api/spreadsheet', x, spreadsheet.processExcel);

	// Image upload
	app.post('/api/upload', x, image.uploadImage);

	// Message sending 
	app.post('/server/processMessage', contact.processMessage);

	// Serve .html file if route not matched
	app.get('*', function(req, res){
		res.sendfile('./client/index.html');
	});
};
