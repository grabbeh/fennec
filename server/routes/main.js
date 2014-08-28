var helper = require('./helper.js')
, _ = require('underscore')
, Trademark = require('../models/trademarkSchema')
, async = require('async')
, jobs = require('./jobs')
, jwt = require('./jwt')
, fs = require('fs')

exports.downloadTrademarks = function(req, res){
    var portfolio = req.query.portfolio.replace(/%20/g, " ");
    jwt.verifyToken(req.query.token, function(err, user){
        var entity = user.entity;
        helper.getTrademarks(entity, portfolio, function(err, trademarks){
        fs.writeFile('server/config/trademarks.json', JSON.stringify(trademarks), function(err){
            var file = 'server/config/trademarks.json';
            res.download(file);
            });
        }); 
    }) 
}

exports.searchTrademarks = function(req, res){
    queryTrademarks(req.user.entity, req.params.portfolio, req.query.country, req.query.group, "Registered", function(err, trademarks){
        res.json(trademarks);
    })
}

function queryTrademarks(entity, portfolio, country, group, status, cb){
    var portfolio = portfolio.replace(/%20/g, " ");
    var mark = group.replace(/%20/g, " ");
    helper.checkIfEUCountry(country, function(err, result){
        if (result){
             var EU =  "European Union";
        }
        Trademark.find()
            .and([{ entity: entity }, { portfolio: portfolio }, { mark: mark}, {status: status}])
            .or([{ 'country.alpha3': country}, { 'country.name': EU }])
            .lean()
            .exec(function(err, trademarks){
                cb(null, trademarks);
        })
    })
}

exports.search = function(req, res){
    //trademark.search( { query: req.body.query }, { hydrate: true}, function(err, results){ 
    /*
    var query =  {
	    query: {
	        query_string: {
	            query: req.body.query
	        },
	        term: {
	            entity:  req.session.userDetails.entity 
	        }
	  }
    }
    */
    Trademark.search( { query: req.body.query }, { hydrate: true }, function(err, results){
	console.log(req.body);
    if (err){
        console.log(err);
		res.status(401).send(err);
	}
	else {
         console.log(results)
	     res.json(results.hits);	
	}
    });
}

exports.getTrademark = function(req, res){
	helper.getTrademark(req.params.id, function(err, trademark){
        helper.findUser(req.user._id, function(err, user){
            user.favourites.forEach(function(fav){
			if (trademark._id.equals(fav)){ trademark.favourite = true;}
        })
		res.json(trademark);

        })
	})
}

exports.addTrademark = function(req, res){
	helper.addTrademark(req.body.trademark, function(err, trademark){
		jobs.sendAlertOnChange(trademark, 'added', function(err, done){
		     res.send({message: "Trade mark added"});	
		})
	});
}

exports.amendTrademark = function(req, res){ 
	helper.amendTrademark(req.body.trademark, function(err, trademark){
		jobs.sendAlertOnChange(trademark, 'updated', function(err, done){
		     res.send({message: "Trade mark updated"});	
		})
	});
}

exports.deleteTrademark = function(req, res){
	helper.deleteTrademark(req.params.id, function(err, trademark){
		jobs.sendAlertOnChange(trademark, 'deleted', function(err, done){
		     res.send({message: "Trade mark deleted"});	
		})
	});
}


