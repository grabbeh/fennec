var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var geoJSON = new Schema({
    type: String,
    id: String,
    properties: Object,
    geometry: Object,
    alpha2: String
});

module.exports = mongoose.model('GeoJSON', geoJSON);