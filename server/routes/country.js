var helper = require('./helper')
, _ = require('underscore')
, Trademark = require('../models/trademarkSchema')
, async = require('async');

exports.marksForCountry = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var country = req.params.country;
    marksForCountry(entity, portfolio, country, function(err, trademarks){
        res.json(trademarks);
    })
}


function marksForCountry(entity, portfolio, country, fn){
    helper.checkIfEUCountry(country, function(err, bool){
        if (bool){
             var EU =  "European Union";
        }
        Trademark.find()
            .and([{ entity: entity }, { portfolio: portfolio }])
            .or([{ 'country.alpha3': country}, { 'country.name': EU }])
            .lean()
            .exec(function(err, trademarks){
                fn(null, trademarks);
        })
    })
}


exports.filterMarksForCountry = function(req, res){
    var keys = req.body.marks;
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var country = req.params.country;
    Trademark.find({ portfolio: portfolio, entity: entity, 'country.alpha3': country}).lean().exec(function(err, trademarks){
        if (keys.indexOf("ALL MARKS") > -1) { 
	      var trademarks = trademarks; 
        }
        else { 
            keys.unshift(_.groupBy(trademarks, 'mark'));
            var trademarks = _.flatten(_.values(_.pick.apply(null, keys))); 
        }
        res.json(trademarks);
    })  
}

exports.editMarksInCountry = function(req, res){
    var entity = req.user.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    Trademark.find({ entity: entity, portfolio: portfolio, 'country.alpha3': req.query.country }).exec(function(err, trademarks){
        async.forEach(trademarks, function(tm, callback){
          tm.country = req.body.trademark.country;
          tm.save();
          callback();
       }, function(err){
           res.json({ msg: "Details updated"})
       })
    })
}