var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var passwordReset = new Schema({
	active: { type: Boolean, default: true },
	email: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('passwordReset', passwordReset);