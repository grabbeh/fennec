var Notification = require('../models/notificationSchema');

exports.addNotification = function(tm, incident, fn){
	console.log(tm);
	new Notification({
		trademark: tm._id,
		portfolio: tm.portfolio,
		entity: tm.entity,
		incident: incident,
		
	}).save(function(err, n){
		if (err) { console.log(err) };
		console.log("Notification added")
		fn(null, true);
	});
}