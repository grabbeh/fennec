var Notification = require('../models/notificationSchema')
,   helper = require('./helper')
, 	async = require('async');

exports.addNotification = function(tm, incident, fn){
	new Notification({
		trademark: tm._id,
		portfolio: tm.portfolio,
		entity: tm.entity,
		incident: incident
	}).save(function(err, n){
		fn(null, true);
	});
}

function retrieveNotificationsForUser(user, fn){
	Notification.find({ requestedBy: user, read: false })
		.populate('trademark')
		.exec(function(err, notifications){
			if (err) { console.log(err) }
			fn(null, notifications);
		})
}

function compare(notifications, user, fn){
	var unreadNotifications = [];
	notifications.forEach(function(notification){
		if (notification.readBy.length === 0){
			unreadNotifications.push(notification);
		}
		else {
			if (notification.readBy.indexOf(user) === -1){
				unreadNotifications.push(notification);
			}
		}
	})
	fn(null, unreadNotifications);
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

