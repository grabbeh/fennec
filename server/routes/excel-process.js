var formatTrademarks = require('../utils/convert-trademark-json')
, saveToDatabase = require('../utils/save-trade-marks-to-database')
, countryData = require('../data/country-data.json')
, geojson = require('../data/world.json')
, addAlpha2 = require('../utils/add-alpha2-to-geojson')
, saveGeoJson = require('../utils/save-geojson-to-database')
, excel = require('excel')
, path = require('path')
, user = require('../routes/users')
, entities = require('../routes/entities')
, Entity = require('../models/entitySchema');

exports.processExcel = function(req, res){
    var opts = {};
    opts.entity = req.session.userDetails.entity;
    opts.portfolio = req.body.name;
    // check name of portfolio against existing entity portfolios and return error if name already exists
    checkNameOfPortfolio(req.body.name, req.session.userDetails.entity, function(err, done){
        if (err){
            res.status(401).send({err: "Portfolio name already in use"});
            return;
        }
        else {
            entities.updatePortfolio(opts.entity, opts.portfolio, function(err, entity){
                user.addPortfolioToUser(req.session.userDetails._id, opts.portfolio, function(err, user){
                	createJson(req.files.spreadsheet.path, function(err, json){
			    if (err){
			         res.json({err: "File must be .xlxs"});
			         return;
			     }
			     processTrademarks(json, countryData, opts, function(err, msg){
			           res.send({ msg: "Spreadsheet uploaded"});
			           });
			    });
	                })
	            })
	        }
	        
	})
}
/*
function createJson(spreadsheet, fn){
    excel(spreadsheet, function(err, data){
        var headers = data[0];
        var arr = [];
        data.shift();
        data.forEach(function(tm){
            var o = {};
            headers.forEach(function(h, i){
              o[h] = tm[i]
            });
            arr.push(o);
        });
        fn(null, arr);
    });
}*/

function checkNameOfPortfolio(name, entity, fn){
    Entity.findOne({ _id: entity }, function(err, entity){
        if (entity.portfolios.indexOf(name) > -1){
            return fn(new Error("Portfolio name already exists"));
        }
        else {
            return fn(null, true)
        }
    })
}

function createJson(spreadsheet, fn){
    var ext = path.extname('spreadsheet');
    /*if (ext != '.xlxs'){
        return fn(new Error("Extension must be .xlxs"));
    }*/
	excel(spreadsheet, function(err, data){
		data.shift();
		fn(null, data);
	})
}

function processGeoJson(world, countryData, fn){
	addAlpha2(world, countryData, function(err, result){
            saveGeoJson(result, function(err, msg){
                 fn(null, msg);	
            })
      })
}

function processTrademarks(portfolio, countryData, opts, fn){
	formatTrademarks(portfolio, countryData, function(err, tms){
            saveToDatabase(tms, opts, function(err, msg){
            	fn(null, msg);
            })
	})
}
