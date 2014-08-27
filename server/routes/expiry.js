
var helper = require('./helper.js')
, _ = require('underscore')
, async = require('async')

exports.expiriesForGroup = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio, function(err, tms){
        var key = req.query.group.replace(/%20/g, " ");
        if (key != "ALL MARKS"){
            var tms = _.groupBy(tms, 'mark')[key];	
        }
        helper.sortTrademarksByExpiryYear(tms, function(err, trademarks){
        	res.json(trademarks);
    	})	 
    })
}

exports.expiriesForCountry = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var country = req.params.country;
    helper.marksForCountry(entity, portfolio, country, function(err, tms){
        helper.sortTrademarksByExpiryYear(tms, function(err, trademarks){
        	res.json(trademarks);
    	})	 
    })
}

exports.expiriesForYear = function(req, res){
	var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
	async.parallel([
		async.apply(helper.getGeoJSON),
		async.apply(helper.getTrademarks, entity, portfolio)
		],
		function(err, results){
			helper.sortTrademarksByExpiryYear(results[1], function(err, tms){
                helper.convertPortfolioAndAddToGeoJSON(results[0], tms[req.query.year], function(err, o){   
                    res.json(o);
                })
			})
		})
	}
