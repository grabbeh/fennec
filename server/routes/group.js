var helper = require('./helper')
, _ = require('underscore')
, Trademark = require('../models/trademarkSchema')
, fav = require('./favourites')
, async = require('async');

exports.favourites = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    async.parallel([ 
    	async.apply(helper.findUser, req.user._id),
    	async.apply(helper.getTrademarks, entity, portfolio)
    	], function(err, results){
    	    var favIds = results[0].favourites;
    	    var trademarks = results[1]
    	    var favourites = [];	
    	    favIds.forEach(function(fav){
                trademarks.forEach(function(tm){
                    if (tm._id.equals(fav)){
                        tm.favourite = true;
                        favourites.push(tm);
                 	}
            })
        })
        res.json(favourites);	
    })
}

exports.groupOfMarks = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");

    async.auto({
        user: function(cb, results){
            helper.findUser(req.user._id, cb);
        },
        trademarks: ['user', function(cb, results){
            helper.getTrademarks(entity, portfolio, cb);
        }]
    }, function(err, results){
        var favourites = results.user.favourites;
        var tms = fav.checkTrademarks(results.trademarks, favourites);
        if (req.query && req.query.group){
            var group = req.query.group.replace(/%20/g, " ");
            var tms = fav.checkTrademarks(_.groupBy(results.trademarks, 'mark')[group], favourites); 
        }
        res.json(tms);
    });
}

// if country is provided in query, delimit list of marks by country

exports.listOfMarks = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
   
    if (req.query && req.query.country){
        var country = req.query.country;
       	helper.checkIfEUCountry(country, function(err, bool){
            if (bool){
                 var EU =  "European Union";
            }
            Trademark.find()
            	.and([{ entity: entity }, { portfolio: portfolio }])
            	.or([{ 'country.alpha3': country}, { 'country.name': EU }])
            	.lean()
            	.exec(function(err, trademarks){
            		createList(trademarks, function(err, list){
            		    console.log(list);
            			res.json(list);
            		})
       		})
    	})	
   }
   else {
   	    helper.getTrademarks(entity, portfolio, function(err, trademarks){
              createList(trademarks, function(err, list){
                 res.json(list);  
    	   })
        })	
    }
 }

function createList(trademarks, fn){
    var list = [];
          var keys = _.keys(_.groupBy(trademarks, 'mark'));
          keys.forEach(function(k){
              var o = {};
              o.name = k;
              o.checked = true;
              list.push(o);
          })
     fn(null, list)
}

exports.editGroupOfMarks = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var mark = req.params.mark.replace(/%20/g, " ");
    Trademark.find({ entity: entity, portfolio: portfolio, mark: mark }).exec(function(err, trademarks){
        async.forEach(trademarks, function(tm, callback){
             tm.mark = req.body.trademark.mark;
             tm.save();
             callback();
        }, function(err){
            res.json({msg: "Name updated"})
        })
    })
}

exports.addLogoToGroup = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var mark = req.params.mark.replace(/%20/g, " ");
    Trademark.find({ entity: entity, portfolio: portfolio, mark: mark }).exec(function(err, trademarks){
        async.forEach(trademarks, function(tm, callback){
             tm.imageUrl = req.body.url;
             tm.save();
             callback();
        }, function(err){
            res.json({msg: "Image added to group"})
        })
    })
}
