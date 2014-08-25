angular.module('app')

	.filter('extractGroup', function(){
    	return function(arr, group){
            return arr.filter(function(i){
                return i.mark === group;
            })
          
        }
	})
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
	
	.filter('extractClasses', function(){
		return function(arr){
			var newArray = [];
			arr.forEach(function(a){
				newArray.push(a.classes);
			})
			return _.uniq(_.flatten(newArray))
		}
		
	})
	
	.filter('extractFavourites', function(){
    	return function(arr){
            return arr.filter(function(i){
                return i.favourite === true;
            })
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
    
    .filter('addSpecifications', function(){
    	
    	var specifications = [{clss: 1, specification:	"Chemicals used in industry, science and photography, as well as in agriculture, horticulture and forestry; unprocessed artificial resins, unprocessed plastics; manures; fire extinguishing compositions; tempering and soldering preparations; chemical substances for preserving foodstuffs; tanning substances; adhesives used in industry; unprocessed plastics in the form of liquids, chips or granules."},


{clss: 2, specification:"Paints, varnishes, lacquers; preservatives against rust and against deterioration of wood; colorants; mordants; raw natural resins; metals in foil and powder form for painters, decorators, printers and artists."},
{clss:3,	specification:"Bleaching preparations and other substances for laundry use; cleaning, polishing, scouring and abrasive preparations; soaps; perfumery, essential oils, cosmetics, hair lotions; dentifrices."},
{clss: 4, specification:"Industrial oils and greases; lubricants; dust absorbing, wetting and binding compositions; fuels and illuminants; candles and wicks for lighting; combustible fuels, electricity and scented candles."},
{clss:5	, specification:"Pharmaceutical and veterinary preparations; sanitary preparations for medical purposes; dietetic food and substances adapted for medical or veterinary use, food for babies; dietary supplements for humans and animals; plasters, materials for dressings; material for stopping teeth, dental wax; disinfectants; preparations for destroying vermin; fungicides, herbicides."},
{clss:6	, specification:"Common metals and their alloys; metal building materials; transportable buildings of metal; materials of metal for railway tracks; non-electric cables and wires of common metal; ironmongery, small items of metal hardware; pipes and tubes of metal; safes; goods of common metal not included in other classes; ores; unwrought and partly wrought common metals; metallic windows and doors; metallic framed conservatories."},
{clss: 7	, specification:"Machines and machine tools; motors and engines (except for land vehicles); machine coupling and transmission components (except for land vehicles); agricultural implements other than hand-operated; incubators for eggs; automatic vending machines."},
{clss: 8	, specification:"Hand tools and hand operated implements; cutlery; side arms; razors; electric razors and hair cutters."},
{clss:9	, specification:"Scientific, nautical, surveying, photographic, cinematographic, optical, weighing, measuring, signalling, checking (supervision), life-saving and teaching apparatus and instruments; apparatus and instruments for conducting, switching, transforming, accumulating, regulating or controlling electricity; apparatus for recording, transmission or reproduction of sound or images; magnetic data carriers, recording discs; compact discs, DVDs and other digital recording media; mechanisms for coin-operated apparatus; cash registers, calculating machines, data processing equipment, computers; computer software; fire-extinguishing apparatus."},
{clss:10, specification:	"Surgical, medical, dental and veterinary apparatus and instruments, artificial limbs, eyes and teeth; orthopaedic articles; suture materials; sex aids; massage apparatus; supportive bandages; furniture adapted for medical use."},
{clss:11, specification:	"Apparatus for lighting, heating, steam generating, cooking, refrigerating, drying, ventilating, water supply and sanitary purposes; air conditioning apparatus; electric kettles; gas and electric cookers; vehicle lights and vehicle air conditioning units."},
{clss:12, specification:	"Vehicles; apparatus for locomotion by land, air or water; wheelchairs; motors and engines for land vehicles; vehicle body parts and transmissions."},
{clss: 13, specification:	"Firearms; ammunition and projectiles, explosives; fireworks."},
{clss:14, specification:	"Precious metals and their alloys; jewellery, costume jewellery, precious stones; horological and chronometric instruments, clocks and watches."},
{clss:15, specification:	"Musical instruments; stands and cases adapted for musical instruments."},
{clss:16, specification:	"Paper, cardboard and goods made from these materials, not included in other classes; printed matter; bookbinding material; photographs; stationery; adhesives for stationery or household purposes; artists' materials; paint brushes; typewriters and office requisites (except furniture); instructional and teaching material (except apparatus); plastic materials for packaging (not included in other classes); printers' type; printing blocks."},
{clss:17, specification:	"Rubber, gutta-percha, gum, asbestos, mica and goods made from these materials; plastics in extruded form for use in manufacture; semi-finished plastics materials for use in further manufacture; stopping and insulating materials; flexible non-metallic pipes."},
{clss: 18, specification:	"Leather and imitations of leather; animal skins, hides; trunks and travelling bags; handbags, rucksacks, purses; umbrellas, parasols and walking sticks; whips, harness and saddlery; clothing for animals."},
{clss:19, specification:	"Non-metallic building materials; non-metallic rigid pipes for building; asphalt, pitch and bitumen; non-metallic transportable buildings; non-metallic monuments; non-metallic framed conservatories, doors and windows."},
{clss:20, specification:	"Furniture, mirrors, picture frames; articles made of wood, cork, reed, cane, wicker, horn, bone, ivory, whalebone, shell, amber, mother-of-pearl, meerschaum or plastic which are not included in other classes; garden furniture; pillows and cushions."},
{clss: 21, specification:	"Household or kitchen utensils and containers; combs and sponges; brushes (except paintbrushes); brush-making materials; articles for cleaning purposes; steel wool; articles made of ceramics, glass, porcelain or earthenware which are not included in other classes; electric and non-electric toothbrushes."},
{clss: 22, specification:	"Ropes, string, nets, tents, awnings, tarpaulins, sails, sacks for transporting bulk materials; padding and stuffing materials which are not made of rubber or plastics; raw fibrous textile materials."},
{clss: 23, specification:	"Yarns and threads, for textile use."},
{clss: 24, specification:	"Textiles and textile goods; bed and table covers; travellers' rugs, textiles for making articles of clothing; duvets; covers for pillows, cushions or duvets."},
{clss:25, specification:	"Clothing, footwear, headgear."},
{clss: 26, specification:	"Lace and embroidery, ribbons and braid; buttons, hooks and eyes, pins and needles; artificial flowers."},
{clss: 27, specification:	"Carpets, rugs, mats and matting, linoleum and other materials for covering existing floors; wall hangings (non-textile); wallpaper."},
{clss: 28, specification:	"Games and playthings; playing cards; gymnastic and sporting articles; decorations for Christmas trees; childrens' toy bicycles."},
{clss: 29, specification:	"Meat, fish, poultry and game; meat extracts; preserved, dried and cooked fruits and vegetables; jellies, jams, compotes; eggs, milk and milk products; edible oils and fats; prepared meals; soups and potato crisps."},
{clss: 30, specification:	"Coffee, tea, cocoa, sugar, rice, tapioca, sago, artificial coffee; flour and preparations made from cereals, bread, pastry and confectionery, edible ices; honey, treacle; yeast, baking-powder; salt, mustard; vinegar, sauces (condiments); spices; ice; sandwiches; prepared meals; pizzas, pies and pasta dishes."},
{clss: 31, specification:	"Agricultural, horticultural and forestry products; live animals; fresh fruits and vegetables, seeds, natural plants and flowers; foodstuffs for animals; malt; food and beverages for animals."},
{clss: 32, specification:	"Beers; mineral and aerated waters; non-alcoholic drinks; fruit drinks and fruit juices; syrups for making beverages; shandy, de-alcoholised drinks, non-alcoholic beers and wines."},
{clss:33, specification:	"Alcoholic beverages (except beers); alcoholic wines; spirits and liqueurs; alcopops; alcoholic cocktails."},
{clss: 34, specification:	"Tobacco; smokers' articles; matches; lighters for smokers."},



{clss: 35, specification:	"Advertising; business management; business administration; office functions; organisation, operation and supervision of loyalty and incentive schemes; advertising services provided via the Internet; production of television and radio advertisements; accountancy; auctioneering; trade fairs; opinion polling; data processing; provision of business information; retail services connected with the sale of [list specific goods]."},
{clss: 36, specification:	"Insurance; financial services; real estate agency services; building society services; banking; stockbroking; financial services provided via the Internet; issuing of tokens of value in relation to bonus and loyalty schemes; provision of financial information."},
{clss: 37, specification:	"Building construction; repair; installation services; installation, maintenance and repair of computer hardware; painting and decorating; cleaning services."},
{clss: 38, specification:	"Telecommunications services; chat room services; portal services; e-mail services; providing user access to the Internet; radio and television broadcasting."},
{clss: 39, specification:	"Transport; packaging and storage of goods; travel arrangement; distribution of electricity; travel information; provision of car parking facilities."},
{clss: 40, specification:	"Treatment of materials; development, duplicating and printing of photographs; generation of electricity."},
{clss: 41, specification:	"Education; providing of training; entertainment; sporting and cultural activities."},
{clss: 42, specification:	"Scientific and technological services and research and design relating thereto; industrial analysis and research services; design and development of computer hardware and software; computer programming; installation, maintenance and repair of computer software; computer consultancy services; design, drawing and commissioned writing for the compilation of web sites; creating, maintaining and hosting the web sites of others; design services."},
{clss: 43, specification:	"Services for providing food and drink; temporary accommodation; restaurant, bar and catering services; provision of holiday accommodation; booking and reservation services for restaurants and holiday accommodation; retirement home services; creche services."},
{clss: 44, specification:	"Medical services; veterinary services; hygienic and beauty care for human beings or animals; agriculture, horticulture and forestry services; dentistry services; medical analysis for the diagnosis and treatment of persons; pharmacy advice; garden design services."},
{clss: 45, specification:	"Legal services; conveyancing services; security services for the protection of property and individuals; social work services; consultancy services relating to health and safety; consultancy services relating to personal appearance; provision of personal tarot readings; dating services; funeral services and undertaking services; fire-fighting services; detective agency services."},
    	];
    	
    	
    return function(classes){
    		var newArray = [];
    		classes.forEach(function(c){
    			specifications.forEach(function(spec){
    				if (c === spec.clss){
    				    var o = {};
    				    o.clss = c;
    				    o.specification = spec.specification;
    				    newArray.push(o);
    				}
    			})
    		})
    		return newArray;

    	}
    })

    


	
	
	


