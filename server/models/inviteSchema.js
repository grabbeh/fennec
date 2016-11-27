var mongoose = require('mongoose')
, Schema = mongoose.Schema
, ObjectId = Schema.ObjectId;

var invite = new Schema({
  active: { type: Boolean, default: true },
  admin: { type: Boolean, default: false },
  entity: String,
  inviter: String,
  email: String
});

module.exports = mongoose.model('invite', invite);
