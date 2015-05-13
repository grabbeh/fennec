var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var User = new Schema({
	portfolios: Array,
    entity: String,
    favourites: Array,
	_id: String,
	hash: String,
	email: String,
	alertFrequency: Array,
	displayOptions: { type: Object, default: {
    showFavourites:
    {
       showFavourites: true,
       name: "Favourites",
       checked: true
    },
    showIncomplete:
    {
      showIncomplete: true,
      name: "Incomplete marks",
      checked: true
    },
    showExpiring: 
    {
      	showExpiring: true,
      	name: "Expiring marks",
      	checked: true
    },
    showActivity:
    {
      	showActivity: true,    
      	name: "Activities",
      	checked: true
    },
    showMap:
    {
      showMap: true,
      name: "Map",
          checked: true
    },
    showChart:
    {
      	showChart: true,
      	name: "Expiry chart",
      	    checked: true
    }, 
    showSummary:
    {
      	showSummary: true,
      	name: "Summary",
      	checked: true
    }

		};
	},
	alertOptions: { type: Array, default:  [
	    {
	      checked: false,
	      name: "Send alert when trade mark expires",
	      functionName: "sendExpiredAlerts",
	      type: "recurring"
	    },
	    {
	      checked: false,
	      name: "Send reminders for expiry",
	      functionName: "sendExpiryAlerts",
	      type: "recurring"
	    },
	    {
	      checked: false,
	      name: "Send alert when trade mark added, edited, or deleted",
	      functionName: "sendAlertOnChange",
	      type: "one-off"
	    }
	  ]},
	isAdmin: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', User); 
