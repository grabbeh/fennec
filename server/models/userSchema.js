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
    displayOptions: {
        type: Object,
        default: {
            showFavourites: {

                name: "Favourites",
                checked: true
            },
            showIncomplete: {

                name: "Incomplete marks",
                checked: true
            },
            showExpiring: {
 
                name: "Expiring marks",
                checked: true
            },
            showActivities: {
  
                name: "Activities",
                checked: true
            },
            showMap: {
    
                name: "Map",
                checked: true
            },
            showChart: {
      
                name: "Expiry chart",
                checked: true
            },
            showSummary: {
         
                name: "Summary",
                checked: true
            }

        }
    },
    alertOptions: {
        type: Array,
        default: [{
            checked: false,
            name: "Send alert when trade mark expires",
            functionName: "sendExpiredAlerts",
            type: "recurring"
        }, {
            checked: false,
            name: "Send reminders for expiry",
            functionName: "sendExpiryAlerts",
            type: "recurring"
        }, {
            checked: false,
            name: "Send alert when trade mark added, edited, or deleted",
            functionName: "sendAlertOnChange",
            type: "one-off"
        }]
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('User', User); 
