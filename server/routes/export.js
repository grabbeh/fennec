
var Trademark = require('../models/trademarkSchema'),
  User = require('../models/userSchema'),
  Notifications = require('../models/notificationSchema'),
  Activities = require('../models/activitySchema'),
  Entities = require('../models/entitySchema'),
  geoJ = require('../models/geoJSONSchema'),
  Invites = require('../models/inviteSchema'),
  passW = require('../models/passwordResetSchema'),
  
   db = require('./server/config/paid-db')

mongoose.createConnection(db, {}, function(err, success){
    if (err) 
        console.log(err);
    else 
        console.log("Connection successful");
});

Trademark.find({}, function(err, data){
	        fs.writeFile('server/exported/trademarks.json', JSON.stringify(data), function(err){
	            console.log("File written")
	            });
        }); 
        
User.find({}, function(err, data){
	        fs.writeFile('server/exported/user.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
Notifications.find({}, function(err, data){
	        fs.writeFile('server/exported/notifications.json', JSON.stringify(data), function(err){
	                   console.log("File written")
	            });
        }); 
        
Activities.find({}, function(err, data){
	        fs.writeFile('server/exported/activities.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
 Entities.find({}, function(err, data){
	        fs.writeFile('server/exported/entities.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
        
geoJ.find({}, function(err, data){
	  fs.writeFile('server/exported/geojson.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
    Invites.find({}, function(err, data){
	        fs.writeFile('server/exported/invites.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
 passW.find({}, function(err, data){
	        fs.writeFile('server/exported/passwords.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
