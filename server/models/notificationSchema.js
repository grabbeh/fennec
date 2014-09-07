var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var Notification = new Schema({
    incident: Object,
    entity: String,
    portfolio: String,
    trademark:  { type: Schema.Types.ObjectId, ref: 'Trademark' },
   //trademark: String,
    readBy: [{ type: String, ref: 'User' }],
});

module.exports = mongoose.model('Notification', Notification); 