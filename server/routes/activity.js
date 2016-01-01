var Activity = require('../models/activitySchema')
, async = require('async')
, helper = require('./helper')
, fav = require('./favourites');

exports.addActivity = function(trademark, changes, type, user, fn){

	new Activity({
		entity: trademark.entity,
		portfolio: trademark.portfolio,
		user: user.toString(),
		changes: changes,
		type: type,
		trademark: trademark._id
	}).save(fn);
}

function getActivities(entity, portfolio, fn){
	Activity.find({ entity: entity, portfolio: portfolio })
		.lean()
		.sort('-created')
		.populate('trademark')
		.exec(function(err, activities){
			fn(null, activities);
	})
}

exports.processActivities = function(req, res){
	async.auto({
        user: function(cb, results){
            helper.findUser(req.user._id, cb);
        },
        activities: function(cb, results){
            getActivities(req.user.entity, req.params.portfolio, cb);
        },
        favourites: ['user', 'activities', function(cb, results){
        	fav.checkActivities(results.activities, results.user.favourites, cb)
        }]
    }, function(err, results){
        res.json(results.favourites);
    });
}
