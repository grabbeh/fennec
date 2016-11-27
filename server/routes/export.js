
var Trademark = require('../models/trademarkSchema'),
  User = require('../models/userSchema'),
  Notifications = require('../models/notificationSchema'),
  Activities = require('../models/activitySchema'),
  Entities = require('../models/entitySchema'),
  geoJ = require('../models/geoJSONSchema'),
  Invites = require('../models/inviteSchema'),
  passW = require('../models/passwordResetSchema'),
  mongoose = require('mongoose'),
  fs = require('fs'),
   db = require('../config/paid-db');

mongoose.connect(db)
console.log("Connection successful");


Trademark.find({}).lean().exec(function(err, data){
	fs.writeFile('../exported/trademarks.json', JSON.stringify(data), function(err){
		console.log("File written")
		});
	}); 




User.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/user.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        });



Notifications.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/notifications.json', JSON.stringify(data), function(err){
				console.log(err)
	                   console.log("File written")
	            })
        })
		
  
Activities.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/activities.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 

		

		
        
 Entities.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/entities.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        



       
geoJ.find({}).lean().exec(function(err, data){
	  fs.writeFile('../exported/geojson.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
       
	   
Invites.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/invites.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
        
 passW.find({}).lean().exec(function(err, data){
	        fs.writeFile('../exported/passwords.json', JSON.stringify(data), function(err){
	              console.log("File written")
	            	
	            });
        }); 
