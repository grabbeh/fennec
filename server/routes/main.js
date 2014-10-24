 var helper = require('./helper')
, _ = require('underscore')
, Trademark = require('../models/trademarkSchema')
, async = require('async')
, jobs = require('./jobs')
, activity = require('./activity')
, jwt = require('./jwt')
, fs = require('fs')
, deepDiff = require('deep-diff').diff;

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
    });
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
    var query = {
            filtered: { 
              query: { query_string: {query:req.body.query}}, 
              filter:{ query: {query_string:{query:req.user.entity}}}  
            }
        }

    Trademark.search( { query: query }, { hydrate: true }, function(err, results){
        if (err){ res.status(401).send(err);}
    	res.json(results.hits);	
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
		}); 
	});
}

exports.amendTrademark = function(req, res){ 
    var revisedTrademark = helper.parseDates(req.body.trademark);
    async.auto({
        getTrademark: function(cb, results){
            var id = helper.exposeId(revisedTrademark);
            helper.getTrademark(id, cb);
        },
        sendAlertOnChange: ['getTrademark', function(cb, results){
            jobs.sendAlertOnChange(revisedTrademark, 'updated', cb)
        }],
        detectDifferences: ['getTrademark', function(cb, results){
            var filteredOldMark = _.omit(results.getTrademark, '_id', 'updated', 'created', '__v');
            var filteredRevisedTrademark = _.omit(revisedTrademark, 'fromNow', 'updated', '__v','created', 'favourite', 'issues');
            var diff = deepDiff(filteredOldMark, filteredRevisedTrademark);
            var filteredDiff = helper.filterDiff(diff); 
            cb(null, filteredDiff); 
        }],
        updateStream: ['detectDifferences', 'getTrademark', function(cb, results){
            activity.addActivity(results.getTrademark, results.detectDifferences, 'updated trade mark', req.user._id, cb);
        }],
        saveTrademark: ['getTrademark', function(cb, results){
            helper.amendTrademark(revisedTrademark, cb);
        }]
    }, function(err, results){
            if (err) { console.log(err); }
            res.send({message: "Trade mark updated"})
    });
}

exports.deleteTrademark = function(req, res){
	helper.deleteTrademark(req.params.id, function(err, trademark){
		jobs.sendAlertOnChange(trademark, 'deleted', function(err, done){
		     res.send({message: "Trade mark deleted"});	
		})
	});
}


