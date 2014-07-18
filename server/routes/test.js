var helper = require('helper')
, blocked = require('blocked')
, express = require('express')
, db = require('../config/db.js')
, mongoose = require('mongoose')
, app = express()
, async = require('async');

var database = 'mongodb://' 
  + db.user + ':' 
  + db.pass + '@' 
  + db.host + ':' 
  + db.port + '/' 
  + db.name;

mongoose.connect(database, function(err){
    if (err) { console.log(err); throw new Error(err.stack);}
  });


app.get('/', function(req, res){
    async.parallel([ 
      	async.apply(helper.getGeoJSON),
	    async.apply(helper.getTrademarks)
	    ],
         function(err, results){
             helper.convertPortfolioAndAddToGeoJSON(results[0], results[1], function(err, gj){
	      	   	 res.json(gj);
	      	 });
         });
    
    
})

app.listen(2001);

