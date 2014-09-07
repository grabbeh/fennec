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

function retrieveNotifications(entity, portfolio, fn){
    if (limit){
    	var limit = limit;
    }
	Notification.find({ entity: entity, portfolio: portfolio})
		.populate('trademark')
		.exec(function(err, notifications){
			fn(null, notificatications);
		})
}

function compare(notifications, user){
	unreadNotifications = [];
	notifications.forEach(function(notification){
		notification.readBy.forEach(function(id){
			if (id != user){
				unreadNotifications.push(notification);
			}
		})
	})
	return unreadNotifications;
}

exports.unreadNotifications = function(req, res){
	async.auto({
		user: function(cb, results){
			helper.findUser(req.user._id, cb);
		},
		notifications: ['user', function(cb, results){
			retrieveNotifications(results.getUser.entity, req.params.portfolio, cb);
		}],
		unreadNotifications: ['user', 'notifications', function(cb, results){
			compare(results.notifications, results.user._id);
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

