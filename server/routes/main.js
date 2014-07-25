var helper = require('./helper.js')
, _ = require('underscore')
, countryData = require('../data/country-data.json')
, trademark = require('../models/trademarkSchema')
, async = require('async')
, jobs = require('./jobs')
, fs = require('fs')

exports.downloadTrademarks = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio, function(err, trademarks){
        fs.writeFile('server/config/trademarks.json', JSON.stringify(trademarks), function(err){
            var file = 'server/config/trademarks.json';
            res.download(file);
        })
    })
}

exports.getWorldGroup = function(req, res){
	var entity = req.session.userDetails.entity;
	var portfolio = req.params.portfolio.replace(/%20/g, " ");
	var group = req.params.group.replace(/%20/g, " ");
	
	async.parallel([ 
      async.apply(helper.getGeoJSON),
	    async.apply(helper.getTrademarks, entity, portfolio)
	    ],
	    function(err, results){
           	var tms = results[1];
	        if (group != "ALL MARKS"){
		        var tms = _.groupBy(results[1], 'mark')[group];	
		    }

	       helper.convertPortfolioAndAddToGeoJSON(results[0], tms, function(err, gj){
	      	   	 res.json(gj);
	      	 });
	    });
	}

exports.getGroup = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var group = req.params.group.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio,  function(err, trademarks){
        var tms = trademarks;
    	if (group != "ALL MARKS"){
            var tms = _.groupBy(trademarks, 'mark')[group];	
        }
        res.json(tms);
    });
}

exports.getCountry = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.checkIfEUCountry(req.params.country, function(err, bool){
        if (bool){
             var EU =  "European Union";
        }
        trademark.find()
        	.and([{ entity: entity }, { portfolio: portfolio }])
        	.or([{ 'country.alpha3': req.params.country}, { 'country.name': EU }])
        	.lean()
        	.exec(function(err, trademarks){
        		res.json(trademarks);
   		})
    })

}

exports.filterCountry = function(req, res){
    var keys = req.body.marks;
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var country = req.params.country;
    trademark.find({ portfolio: portfolio, entity: entity, 'country.alpha3': country}).lean().exec(function(err, trademarks){
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

exports.getListOfMarks = function(req, res){
   var entity = req.session.userDetails.entity;
   var portfolio = req.params.portfolio.replace(/%20/g, " ");
   helper.getTrademarks(entity, portfolio, function(err, trademarks){
          createList(trademarks, function(err, list){
             res.json(list);  
	   })
     })
 }

// Provides basic list of marks on basis of provided array 

exports.filterListOfMarks = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.checkIfEUCountry(req.params.country, function(err, bool){
        if (bool){
             var EU =  "European Union";
        }
        trademark.find()
        	.and([{ entity: entity }, { portfolio: portfolio }])
        	.or([{ 'country.alpha3': req.params.country}, { 'country.name': EU }])
        	.lean()
        	.exec(function(err, trademarks){
        		createList(trademarks, function(err, list){
        			res.json(list);
        		})
   		})
    })	
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

// Provides geojson file with trademarks filtered on basis of given array
// 
exports.getFilteredWorld = function(req, res){
      var entity = req.session.userDetails.entity;
      console.log(entity);
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

exports.editGroupOfMarks = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var mark = req.params.mark.replace(/%20/g, " ");
    trademark.find({ entity: entity, portfolio: portfolio, mark: mark }).exec(function(err, trademarks){
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
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    var mark = req.params.mark.replace(/%20/g, " ");
    trademark.find({ entity: entity, portfolio: portfolio, mark: mark }).exec(function(err, trademarks){
        async.forEach(trademarks, function(tm, callback){
             tm.imageUrl = req.body.url;
             tm.save();
             callback();
        }, function(err){
            res.json({msg: "Image added to group"})
        })
    })
}

exports.editMarksInCountry = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    trademark.find({ entity: entity, portfolio: portfolio, 'country.alpha3': req.params.alpha3 }).exec(function(err, trademarks){
        async.forEach(trademarks, function(tm, callback){
          tm.country = req.body.trademark.country;
          tm.save();
          callback();
       }, function(err){
           res.json({ msg: "Details updated"})
       })
    })
}

exports.getExpiriesForYear = function(req, res){
	var entity = req.session.userDetails.entity;
        var portfolio = req.params.portfolio.replace(/%20/g, " ");
	async.parallel([
		async.apply(helper.getGeoJSON),
		async.apply(helper.getTrademarks, entity, portfolio)
		],
		function(err, results){
			helper.sortTrademarksByExpiryYear(results[1], function(err, tms){
				helper.convertPortfolioAndAddToGeoJSON(results[0], tms[req.body.year], function(err, o){
					res.json(o);
				})
			})
		})
	}

exports.countryData = function(req, res){
	res.json(countryData);
}

exports.filteredCountryData = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio, function(err, tms){
        var arr = [];
        var countries = _.groupBy(tms, 'country');
        tms.forEach(function(tm){
            countryData.forEach(function(c){
                if (tm.country === undefined){
                  console.log(tm);
                }
                if (tm.country.alpha3 === c.alpha3){
                    arr.push(c);
                }
            })
        })
        res.json(_.uniq(arr));
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
    trademark.search( { query: req.body.query }, { hydrate: true }, function(err, results){
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
		res.json(trademark);
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

exports.provideExpiryDates = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio, function(err, tms){
        helper.sortTrademarksByExpiryYear(tms, function(err, trademarks){
		   res.json(trademarks)
		})
    })
}

exports.provideExpiryDatesForGroup = function(req, res){
    var entity = req.session.userDetails.entity;
    var portfolio = req.params.portfolio.replace(/%20/g, " ");
    helper.getTrademarks(entity, portfolio, function(err, tms){
        var key = req.params.group.replace(/%20/g, " ");
        if (key != "ALL MARKS"){
            var tms = _.groupBy(tms, 'mark')[key];	
        }
        helper.sortTrademarksByExpiryYear(tms, function(err, trademarks){
        	res.json(trademarks);
    	})	 
    })
}


