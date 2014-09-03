var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var Activity = new Schema({
	entity: String,
	portfolio: String,
	user: { type: String, ref: 'User' },
    trademark:  { type: Schema.Types.ObjectId, ref: 'Trademark' },
    type: String,
    changes: Object,
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', Activity); 