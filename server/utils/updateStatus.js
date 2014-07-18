
    var db = require('../config/db')
    , trademark = require('../models/trademarkSchema')
    , Entity = require('../models/entitySchema')
    , moment = require('moment')
    , async = require('async')
    , mongoose = require('mongoose')
    , fs = require('fs');

mongoose.connect('mongodb://' + db.user + ':' 
    + db.pass + '@' 
    + db.host + ':' 
    + db.port + '/' 
    + db.name,
    function(err){
    	if (err) {throw new Error(err.stack);}
  	});
  
new Entity({
    _id: "OMNICORP"
}).save(function(err, entity){
    if (err) { console.log(err)}
    else {
        console.log("Saved")
    }
})



function updateTrademark(id, update, fn){
     trademark.findOneAndUpdate({ _id: id }, update, fn)
}
