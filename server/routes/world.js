var helper = require('./helper')
, favourites = require('./favourites')
, _ = require('underscore')
, countryData = require('../data/country-data.json')
, async = require('async');

exports.countryData = function(req, res){
	if (req.query && req.query.portfolio){
		var entity = req.user.entity;
		var portfolio = req.query.portfolio.replace(/%20/g, " ");
		helper.getTrademarks(entity, portfolio, function(err, tms){
		var arr = [];
		var countries = _.groupBy(tms, 'country');
		tms.forEach(function(tm){
		     countryData.forEach(function(c){
		          if (tm.country.alpha3 === c.alpha3){
		                arr.push(c);
		          }
		     })
		})
		res.json(_.uniq(arr));
	    })	
	}
	else {
	     res.json(countryData);	
	}
}


exports.worldForGroup = function(req, res){
	var entity = req.user.entity;
	var portfolio = req.params.portfolio.replace(/%20/g, " ");
	var group = req.params.group.replace(/%20/g, " ");
	
	async.parallel([ 
        	async.apply(helper.getGeoJSON),
	    	async.apply(helper.getTrademarks, entity, portfolio),
	    	async.apply(helper.findUser, req.user._id)
	    ],
	    function(err, results){
           	var tms = favourites.addFavouriteProperty(results[1], results[2].favourites);
	        if (group != "ALL MARKS"){
		        var tms = favourites.addFavouriteProperty(_.groupBy(results[1], 'mark')[group], results[2].favourites);	
		    }

	       helper.convertPortfolioAndAddToGeoJSON(results[0], tms, function(err, gj){
	      	   	 res.json(gj);
	      	 });
	    });
	}

// Provides geojson file with trademarks filtered on basis of given array
// 
exports.worldForListOfMarks = function(req, res){
      var entity = req.user.entity;
      var portfolio = req.params.portfolio.replace(/%20/g, " ");
      var keys = req.body.marks;
      async.parallel([ 
      	  async.apply(helper.getGeoJSON),
	      async.apply(helper.getTrademarks, entity, portfolio)
	      ],
	      function(err, results){
	      	   if (keys.indexOf("ALL MARKS") > -1) { 
	      	   	var trademarks = results[1]; 
	      	   }
               else { keys.unshift(_.groupBy(results[1], 'mark'));
                   var trademarks = _.flatten(_.values(_.pick.apply(null, keys))); 
               }
	      	   helper.convertPortfolioAndAddToGeoJSON(results[0], trademarks, function(err, gj){
	      	   	 res.json(gj);
	      	   });
	      });
	}


exports.worldForCountry = function(req, res){
	var country = req.query.country;
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    async.parallel([ 
      	  async.apply(helper.getGeoJSON),
	      async.apply(helper.marksForCountry, entity, portfolio, country)
	      ],
	      function(err, results){
	      	   helper.convertPortfolioAndAddToGeoJSON(results[0], results[1], function(err, gj){
	      	   	 res.json(gj);
	      	   });
	      });
}
