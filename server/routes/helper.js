var Trademark = require('../models/trademarkSchema'),
    User = require('../models/userSchema'),
    mongoose = require('mongoose'),
    geoj = require('../models/geoJSONSchema'),
    _ = require('underscore'),
    moment = require('moment'),
    EU = require('../data/EU.json'),
    async = require('async');

function groupByCountry(portfolio, fn){
	fn(null, _.groupBy(portfolio, 'alpha3'));
}

function addEUTrademarks(TMsbyCountry, fn){
	var EUtms = TMsbyCountry.EU;
	if (EUtms === undefined){
		fn(null, TMsbyCountry);
	}
	else {
		EU.forEach(function(country){
	    	if (TMsbyCountry[country] === undefined){
	    		TMsbyCountry[country] = [];
	    	}
            EUtms.forEach(function(mark){
                TMsbyCountry[country].push(mark);
            });
	    });
		fn(null, TMsbyCountry);
	}
}

function groupTrademarksByStatus(obj, fn){
    for (var key in obj){
    	var groupByStatus = _.groupBy(obj[key], 'status');
    	obj[key] = groupByStatus;
    }	
    fn(null, obj);
}

function addToGeoJson(gj, tms, fn){
	var copy = deepCopy(gj);
	copy.forEach(function(c){
		c.properties.trademarks = tms[c.id];
		checkStatusOfCountry(c, tms, function(err, status){
			c.properties.status = status;
		});
	});
	fn(null, copy);
}

function checkStatusOfCountry(c, tms, fn){
	if (!tms[c.id]){ return fn(null, false); }
	
	var re = tms[c.id].Registered 
	,	pe = tms[c.id].Pending
	,	pu = tms[c.id].Published;
	
	if (re && !pe && !pu){
		return fn(null, "only registered");
	}
	if (!re && pe && !pu){
		 return fn(null, "only pending");
	}
	if (!re && !pe  && pu ){
		return fn(null, "only published");
	}
	if (re && pe && pu){
		return fn(null, "registered pending published");
	}
	if (!re  && pe && pu){ 
		return fn(null, "pending published");
	}
	if (re && pe && !pu){
		return fn(null, "registered pending");
	}
	if (re && !pe && pu){
		return fn(null, "registered published");
	}
}

function convertPortfolio(trademarks, fn){
	async.waterfall([
		async.apply(groupByCountry, trademarks),
		function(TMsGroupedByCountry, callback){
	    	addEUTrademarks(TMsGroupedByCountry, callback);
	    },
	    function(revisedGroupByCountry, callback){
	    	groupTrademarksByStatus(revisedGroupByCountry, callback)

	    }], function(err, splitByStatus){
			fn(null, splitByStatus);
		});
}

exports.getGeoJSON = function(fn){
	geoj.find({}).lean().exec(function(err, geojson){
		fn(null, geojson);
	})
}

// Country marks
exports.marksForCountry = function(entity, portfolio, country, fn){
    Trademark.find({ entity: entity, portfolio: portfolio, 'country.alpha3': country, active: true})
		.lean()
    	.exec(function(err, trademarks){
        	fn(null, trademarks);
    })
}

exports.getAllTrademarks = function(fn){
	Trademark.find({}, function(err, trademarks){
		fn(null, trademarks);
	})
}

exports.getTrademarks = function(entity, portfolio, fn){
	Trademark.find({ entity: entity, portfolio: portfolio, active: true })
		.lean()
		.sort('expiryDate.DDate')
		.exec(function(err, trademarks){ 
			fn(null, trademarks); 
		});
	}

exports.getTrademark = function(id, fn){
	Trademark
		.findOne({ _id: id })
		.lean()
		.exec(function(err, trademark){
			fn(null, trademark);
	});
}

exports.convertPortfolioAndAddToGeoJSON = function(geojson, trademarks, fn){
	convertPortfolio(trademarks, function(err, revisedTMs){
		addToGeoJson(geojson, revisedTMs, function(err, gj){
			fn(null, gj);
		});
	});
}

exports.addTrademark = function(tm, entity, fn){
	saveTrademark(tm, entity, function(err, doc){
		fn(null, doc);
	})
}

exports.parseDates = function(tm){
	if (tm.registrationDate.DDate && typeof tm.registrationDate === "object")
		tm.registrationDate.DDate = new Date(tm.registrationDate.DDate);
	if (tm.filingDate.DDate && typeof tm.filingDate === "object")
		tm.filingDate.DDate = new Date(tm.filingDate.DDate);
	if (tm.expiryDate.DDate && typeof tm.expiryDate === "object")
		tm.expiryDate.DDate = new Date(tm.expiryDate.DDate)
	return tm;
}

exports.amendTrademark = function(tm, fn){

	if (typeof tm.registrationDate === "string"){
		tm.registrationDate.stringDate = tm.registrationDate;
		tm.registrationDate.DDate = new Date(moment(tm.registrationDate, 'MM-DD-YYYY')).toISOString();
	}
	if (typeof tm.expiryDate === "string"){
		tm.registrationDate.stringDate = tm.expiryDate;
		tm.expiryDate.DDate = new Date(moment(tm.expiryDate, 'MM-DD-YYYY')).toISOString();
	}
	Trademark.findOne({_id: exposeId(tm) }, function(err, oldTm){
		if (err)
			console.log(err);
		
		for (var prop in tm){
			oldTm[prop] = tm[prop];
		}
		oldTm.save(fn);
	});
}

exports.deleteTrademark = function(id, fn){
	Trademark.findOneAndUpdate({ _id: id }, { active: false }, function(err, success){
		fn(null, success);
	})
}

exports.removeId = function(obj){
   delete obj._id;
   return obj;
}

function exposeId(tm){
	var id = mongoose.Types.ObjectId(tm._id.toString());
	delete tm._id;
	return id;
}

exports.exposeId = function(tm){
	tm._id = mongoose.Types.ObjectId(tm._id);
	return tm._id;
}

function saveTrademark(tm, entity, fn){
	
	var filingDateObject = {}
	, registrationDateObject = {}
	, expiryDateObject = {}; 
	
	if (tm.filingDate)
	
		filingDateObject.stringDate = tm.filingDate;
		filingDateObject.DDate = new Date(moment(tm.filingDate, 'MM-DD-YYYY')).toISOString();
	
	if (tm.registrationDate)
	
		registrationDateObject.stringDate = tm.registrationDate;
		registrationDateObject.DDate = new Date(moment(tm.registrationDate, 'MM-DD-YYYY')).toISOString();
	
	if (tm.expiryDate)
	
		expiryDateObject.stringDate = tm.expiryDate;
		expiryDateObject.DDate = new Date(moment(tm.expiryDate, 'MM-DD-YYYY')).toISOString();
	
	new Trademark({
	    entity: entity,
	    portfolio: tm.portfolio,
	    mark: tm.mark, 
	    status: tm.status,
	    country: tm.country,
	    alpha3: tm.country.alpha3,
	    classes: tm.classes,
	    filingDate: filingDateObject, 
	    registrationDate: registrationDateObject,
	    expiryDate: expiryDateObject,
	    applicationNumber: tm.applicationNumber,
	    registrationNumber: tm.registrationNumber
	}).save(fn)
}

exports.sortTrademarksByExpiryYear = function(trademarks, fn){
	var obj = {};
    var currentyear = moment().year()
    var currentyearPlusTen = moment().add('y', 11).year();
    for (var i = currentyear; i < currentyearPlusTen ;i++){
       obj[i] = [];
       filterByExpiryYear(i, trademarks, obj)
    }
    fn(null, obj);
}



function filterByExpiryYear(year, trademarks, obj){
    trademarks.forEach(function(tm){
        if (moment(tm.expiryDate.stringDate, 'MM/DD/YYYY').year() === year){
            obj[year].push(tm);
        }
    });
}

exports.checkIfEUCountry = function(country, fn){
    if ((EU.indexOf(country) > -1) )
         return fn(null, true);
	else 
        fn(null, false);
    
}

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}

exports.findUser = function(id, fn){
     User.findOne({ _id: id}, function(err, user){
            fn(null, user);
        })	
}

exports.filterDiff = function(a){
	var arr = [];
	a.forEach(function(change){
		var o = {};
		// Item edited
		if (change.kind === "E"){
		 	if (change.path[0] === "comments" && change.path[2] === "text"){
		 		o.attr = change.path[0];
		 		o.added = change.rhs;
		 		o.removed = change.lhs;
		 	}
		 	if (change.path[0] != "comments"){
		 		o.attr = change.path[0];
		 		o.added = change.rhs;
		 		o.removed = change.lhs;
		 	}
			arr.push(o); 
		}
		if (change.kind === "A"){
			// Item added to existing array
			if (change.item.kind === "N"){
				o.attr = change.path[0];
				if (change.path[0] === "comments")
						o.added = change.item.rhs.text;
				else 
					o.added = change.item.rhs;
				arr.push(o);
			}
			// Deleted item
			if (change.item.kind === "D"){
				o.attr = change.path[0];
				if (change.path[0] === "comments")
					o.removed = change.item.lhs.text
				else 
					o.removed = change.item.lhs;
				arr.push(o);	
			}
		}
		// New item
		if (change.kind === "N"){
			o.attr = change.path[0];
			if (change.path[0] === "comments")
				o.added = change.rhs[0].text;
			else
				o.added = change.rhs[0];
			arr.push(o);
		}
		
	})
	return arr;
}
