var mongoose = require('mongoose')
    mongoosastic = require('mongoosastic')
   , Schema = mongoose.Schema
   , db = require('../config/paid-db')
   , ObjectId = Schema.ObjectId;

var Trademark = new Schema({
    entity: {type:String, es_indexed: true},
    portfolio: { type: String, es_indexed: true},
    mark: {type:String, es_indexed:true},
    status: {type:String, es_indexed:true},
    country: {type:Object, es_indexed:true},
    alpha3: String,
    classes: Array,
    filingDate: Object,
    registrationDate: Object,
    expiryDate: Object,
    applicationNumber: {type:String, es_indexed:true},
    registrationNumber: {type:String, es_indexed:true},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    deleted: Boolean
});

Trademark.plugin(mongoosastic);

var tm = mongoose.model('Trademark', Trademark);

mongoose.connect('mongodb://' 
  + db.user + ':' 
  + db.pass + '@' 
  + db.host + ':' 
  + db.port + '/' 
  + db.name,
  function(err){
    if (err) {throw new Error(err.stack);}
  });

var stream = tm.synchronize()
  , count = 0;

stream.on('data', function(err, doc){
  count++;
});

stream.on('close', function(){
  console.log('indexed ' + count + ' documents!');
});

stream.on('error', function(err){
  console.log(err);
});

