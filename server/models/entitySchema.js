var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var Entity = new Schema({
    _id: String,
    users:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    portfolios: Array
});

module.exports = mongoose.model('Entity', Entity); 