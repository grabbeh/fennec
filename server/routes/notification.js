var Notification = require('../models/notificationSchema')
,   helper = require('./helper')
, 	async = require('async')
, 	fav = require('./favourites');

exports.addNotification = function(tm, user, incident, fn){
	new Notification({
		trademark: tm._id,
		portfolio: tm.portfolio,
		user: user,
		entity: tm.entity,
		incident: incident
	}).save(function(err, success){
		fn(null, true);
	});
}

function retrieveNotificationsForUser(user, fn){
	Notification.find({ user: user, read: false })
		.lean()
		.populate('trademark')
		.exec(function(err, notifications){
			fn(null, notifications);
		});
}

exports.unreadNotifications = function(req, res){

	 async.auto({
        user: function(cb, results){
            helper.findUser(req.user._id, cb);
        },
        notifications: function(cb, results){
            retrieveNotificationsForUser(req.user._id, cb);
        },
        favourites: ['user', 'notifications', function(cb, results){
        	fav.checkActivities(results.notifications, results.user.favourites, cb)
        }]
    }, function(err, results){
        res.json(results.favourites);
    });
}

exports.updateNotification = function(req, res){
	var notification = req.body;
	var id = helper.exposeId(notification);
	var tmId = notification.trademark._id;
	notification.trademark = tmId;
	Notification.findOneAndUpdate({ _id: id }, helper.removeId(notification), function(err, not){
	})
}

