var Notification = require('../models/notificationSchema')
,   helper = require('./helper')
, 	async = require('async');

exports.addNotification = function(tm, user, incident, fn){
	new Notification({
		trademark: tm._id,
		portfolio: tm.portfolio,
		user: user,
		entity: tm.entity,
		incident: incident
	}).save(function(err, n){
		fn(null, true);
	});
}

function retrieveNotificationsForUser(user, fn){
	Notification.find({ user: user, read: false })
		.populate('trademark')
		.exec(function(err, notifications){
			if (err) { console.log(err) }
			fn(null, notifications);
		})
}

exports.unreadNotifications = function(req, res){
	retrieveNotificationsForUser(req.user._id, function(err, notifications){
		res.json(notifications);
	}
}

exports.updateNotification = function(req, res){
	var notification = req.body;
	var id = helper.exposeId(notification);
	var tmId = notification.trademark._id;
	notification.trademark = tmId;
	Notification.findOneAndUpdate({ _id: id }, helper.removeId(notification), function(err, not){
		if (err) { console.log(err); }
		else {
		     console.log("Notification updated")
		}
	})
}

