var Notification = require('../models/notificationSchema')
, 	async = require('async');

exports.addNotification = function(tm, incident, fn){
	new Notification({
		trademark: tm._id,
		portfolio: tm.portfolio,
		entity: tm.entity,
		incident: incident,
		
	}).save(function(err, n){
		fn(null, true);
	});
}

function retrieveNotificationsForEntity(entity, fn){
	Notification.find({ entity: entity })
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
		   notification.readBy.forEach(function(id){
		        unreadNotifications.push(notification);
	           })	
		}
	})
	fn(null, unreadNotifications);
}

exports.unreadNotifications = function(req, res){
	async.auto({
		user: function(cb, results){
			helper.findUser(req.user._id, cb);
		},
		notifications: ['user', function(cb, results){
			retrieveNotificationsForEntity(results.user.entity, cb);
		}],
		unreadNotifications: ['user', 'notifications', function(cb, results){
			compare(results.notifications, results.user._id, cb);
		}]
	}, function(err, results){
		res.json(results.unreadNotifications);
	})
}

exports.updateNotification = function(req, res){
	var id = helper.exposeId(req.body.notification);
	Notification.findOneAndUpdate({ _id: id }, helper.removeId(req.body.notification), function(err, not){
		console.log("Notification updated")
	})
}

