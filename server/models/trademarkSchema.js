var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , mongoosastic = require('mongoosastic');

var Trademark = new Schema({
    portfolio: { type: String, index: true },
    entity: { type: String, index: true },
    mark: { type: String, index: true },
    status: String,
    country: Object,
    alpha3: String,
    classes: Array,
    filingDate: Object,
    registrationDate: Object,
    expiryDate: Object,
    applicationNumber: String,
    registrationNumber: Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    imageUrl: String
});

Trademark.plugin(mongoosastic);

module.exports = mongoose.model('Trademark', Trademark);
