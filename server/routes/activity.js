var Activity = require('../models/activitySchema');

exports.addActivity = function(trademark, changes, type, user, fn){
	new Activity({
		entity: trademark.entity,
		portfolio: trademark.portfolio,
		user: user.toString(),
		changes: changes,
		type: type,
		trademark: trademark._id
	}).save(function(err, act){
		fn(null, true)
	})
}

exports.findActivites = function(entity, portfolio, fn){
	Activity.find({ entity: entity, portfolio: portfolio }).lean().exec(function(err, activities){
		fn(err, activities);
	})
}