var helper = require('./helper')
	, checkFavourites = require('./favourites')
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
	var q = req.query;
	async.parallel([ 
		async.apply(helper.getGeoJSON),
		async.apply(helper.getTrademarks, entity, portfolio),
		async.apply(helper.findUser, req.user._id)
	    ],
	    function(err, results){
           	var tms = checkFavourites(results[1], results[2].favourites);
	        if (q && q.group){
	        	var group = q.group.replace(/%20/g, " ");
		        var tms = checkFavourites(_.groupBy(results[1], 'mark')[group], results[2].favourites);	
	        }
	        if (q && q.country){
	        	var country = q.country;
	        	var tms = checkFavourites(_.groupBy(results[1], 'alpha3')[country], results[2].favourites);
	        }

	        helper.convertPortfolioAndAddToGeoJSON(results[0], tms, function(err, gj){
	      	   	 res.json(gj);
	      	 });
	    });
	}

exports.worldForListOfMarks = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var marks = req.body.marks;
    async.parallel([ 
      	async.apply(helper.getGeoJSON),
	    async.apply(helper.getTrademarks, entity, portfolio)
	    ],
	    function(err, results){
	      	if (marks.indexOf("ALL MARKS") > -1)  
	      	    var trademarks = results[1]; 
            else { 
               	marks.unshift(_.groupBy(results[1], 'mark'));
                var trademarks = _.flatten(_.values(_.pick.apply(null, marks))); 
            }
	      	helper.convertPortfolioAndAddToGeoJSON(results[0], trademarks, function(err, gj){
	      	   	res.json(gj);
	      	});
	    });
	}
