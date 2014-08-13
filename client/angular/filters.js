angular.module('app')
	.filter('fromNow', function(){
		return function(input){
			input.forEach(function(i){
				var date = moment(i.expiryDate.stringDate, "MM/DD/YYYY").fromNow();
				i.fromNow = date;
				})
			return input;
		}
	})
	
	.filter('uniqueMarks', function(){
		return function(arr){
	         return _.keys(_.groupBy(arr, 'mark'))
	    }
	})
	
	.filter('favouriteMarks', function(){
		return function(arr){
			var newArray = [];
			arr.forEach(function(a){
				if (a.favourite){
				   newArray.push(a);	
				}
			})
			return newArray;
		}
	})
	
	.filter('groupByStatus', function(){
		return function(trademarks){
			var group = _.groupBy(trademarks, 'status');
			var arr = [];
			for (var key in group){
			     var o = {};
			     o.status = key;
			     o.number = group[key].length;
		             arr.push(o);
			    }
		    return arr;	
	    }
	})
	
	.filter('extractExpiryDates', function(){
		return function(obj){
			var arr = [];
			for (var key in obj){
		        var o = {}
		        o.year = key;
		        o.number = obj[key].length;
		        arr.push(o);
		    }
		    return arr;
		}
	})
	
	.filter('extractYears', function(){
		return function(arr){
			var ar = _.map(arr, function(a){
				return a.year;
			})
			return ar;
		}
	})
	
	.filter('extractLength', function(){
		return function(arr){
			var ar = _.map(arr, function(a){
				return a.number;
			})
			return ar;
		}	
	})
	
	.filter('extractRegisteredMarks', function(){
		return function(trademarks){
		var arr = [];
		trademarks.forEach(function(tm){
		     if (tm.status === "Registered" && tm.expiryDate.stringDate){
		         arr.push(tm);
		     }
		 })
         return arr;
         }
	})

	.filter('sortByExpiryDate', function(){
		var date_sort_desc = function (a, b) {
		  var expiryOne = moment(a.expiryDate.stringDate, "MM/DD/YYYY");
		  var expiryTwo = moment(b.expiryDate.stringDate, "MM/DD/YYYY");
		  if (moment(a.expiryDate.stringDate, "MM/DD/YYYY") > moment(b.expiryDate.stringDate, "MM/DD/YYYY")) return 1;
		  if (moment(a.expiryDate.stringDate, "MM/DD/YYYY") < moment(b.expiryDate.stringDate, "MM/DD/YYYY")) return -1;
		  return 0;
		};
		return function(trademarks){
			trademarks.sort(date_sort_desc);
			return trademarks;
		}
	})

	.filter('incompleteMarks', function(){
		return function(trademarks){
	         var arr = [];
		     trademarks.forEach(function(tm){
		     	  tm.issues = [];
		     	  if (tm.status === "Registered" && tm.expiryDate.stringDate === false){
		     	  	tm.issues.push("Registered but no expiry date");
		     	  }
                  if (tm.applicationNumber === "--"){
                      tm.issues.push("Application number unknown")
                  }
		     	  if (tm.classes[0] === null){
		     	  	tm.issues.push("Classes are unknown");
		     	  }
		     	  if (moment(tm.expiryDate.stringDate, "MM/DD/YYYY").year() - moment().year() > 10 ){
		     	  	tm.issues.push("Expiry more than 10 years away");
		     	  }
		     	  if (tm.issues.length){
		     	  	arr.push(tm)
		     	  }
		     	  
		     })
		     return arr;
		}
	})
	
	.filter('groupByMarks', function(){
		return function(trademarks){
		     var arr = [];
		     var keys = _.keys(_.groupBy(trademarks, 'mark'));
		     keys.forEach(function(k){
		     	 var o = {};
		     	 o.name = k;
		     	 o.checked = true;
		     	 arr.push(o);
		     })

		     return arr;
		}
	})
	
	.filter('extractCheckedMarks', function(){
		return function(ar){
	            var arr = [];
	            ar.forEach(function(a){
	                if (a.checked === true){
	                    arr.push(a.name);
	                }
	            })
	            return arr;
	        }
	})
	
	.filter('unTickAllExceptSelected', function(){
		return function(ar, item){
			var arr = [];
			ar.forEach(function(a){
				if (item.name === a.name){
					a.checked = true;
					arr.push(a);
				}
				else {
				     a.checked = false;
				     arr.push(a);
				}
			})
			return arr;
		}
	})
	
	.filter('untickAll', function(){
		return function(ar){
	            var arr = [];
	            ar.forEach(function(a){
	                if (a.checked === true){
	                    a.checked = false;
	                    arr.push(a);
	                }
	            })
	            return arr;
	        }
	})
	
	
	.filter('tickAll', function(){
		return function(ar){
	            var arr = [];
	            ar.forEach(function(a){
	                if (a.checked === false){
	                    a.checked = true;
	                    arr.push(a);
	                }
	            })
	            return arr;
	        }
	})

    .filter('uncheckAllExceptPresent', function(){
		return function(markList, returnedMarks){
			var arr = [];
            angular.forEach(markList, function(m){ 
                angular.forEach(returnedMarks, function(tm){
                    if (tm.mark === m.name){
                        m.checked = true;
                        arr.push(m);
                    }
                    else {
                        m.checked = false;
					}  
                })  
            })
			return arr;
		}
	})

	.filter('extractCountries', function(){
        return function(marks){
            var arr = [];
            angular.forEach(marks, function(tm){
				arr.push(tm.country.name);
            })
            return arr;
        } 
    })
    
    
    .filter('checkIfEU', function(){
        return function(countries){
            var arr = [];
            angular.forEach(countries, function(c){
                if (c != "European Union"){
                    arr.push(c);
                }
            })
            return arr;
        }
    })


	.filter('extractCountryData', function(){
        return function(trademarks){
            var arr = [];
            angular.forEach(trademarks, function(tm){
                arr.push(tm.country)
            })
            return arr;
        }
    })

    


	
	
	


