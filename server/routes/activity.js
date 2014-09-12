var Activity = require('../models/activitySchema');

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

exports.findActivities = function(req, res){
	Activity.find({ entity: req.user.entity, portfolio: req.params.portfolio })
		.sort('created')
		.lean()
		.populate('trademark')
		.exec(function(err, activities){
			res.json(activities);
	});
}
