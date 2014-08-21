angular.module('app')

 	.controller('quickSearchCtrl', ['$scope', '$filter', '$http', '$routeParams', '$location', 'trademarkReviser', function($scope, $filter, $http, $routeParams, $location, trademarkReviser){
 	    var $ = $scope;
 	    $http.get('/api/countryData')
            .success(function(countries){
                $.countrydata =  $filter('orderBy')(countries, 'name');
            })

        trademarkReviser.getListOfMarks($routeParams.portfolio)
         .then(function(data){
            $.marks = data;
        })
       

        $.searchTrademarks = function(tm, country){
            return $http.get('/api/searchTrademarks/' + $routeParams.portfolio + '?group=' + tm + '&country=' + country)
               .then(function(response){
                    $location.search({ group: tm, country: country})
                    return response.data;   
            });
        }

        $.selectMark = function(){
            if ($.country === undefined){
                $.message = "Now provide a country";
                return;
            }

            $.searchTrademarks($.mark.name, $.country.alpha3).then(function(marks){
                $scope.message = "";
                if (marks.length > 0){
                    $.result = "Use the 'R' symbol for the following:";
                    $.classes = $filter('orderBy')($filter('addSpecifications')($filter('extractClasses')(marks)), 'clss');
                }
                else {
                    $.result = "Use the 'TM' symbol";
                    $.classes = "";
                }
            })
            
        }
 		
 	$scope.quickSearch = function(){
            if ($.mark === undefined){
                $.message = "Now provide a mark";
                return;
            }

            $.searchTrademarks($.mark.name, $.country.alpha3).then(function(marks){
                $scope.message = "";
                if (marks.length > 0){
                    $.result = "Use the 'R' symbol for the following";
                    $.classes = $filter('orderBy')($filter('addSpecifications')($filter('extractClasses')(marks)), 'clss');
                }
                else {
                    $.result = "Use the 'TM' symbol";
                    $.classes = "";
                }
            })
           
 		}

 		
 	}])

     .controller('landingPageCtrl', ['$scope', '$window', '$http', 'userGetter', '$location', '$rootScope', function($scope, $window, $http, userGetter, $location, $rootScope){
       var $ = $scope;
       $.loadDemo = function(){
            $http.post('/server/login', { password: "demo", username: "demo@demo.com" })
                .success(function(res){
                    $window.sessionStorage.token = res.token;
                    $rootScope.user = true;
                    $location.path('/home/ACME INC');
                })
                .error(function(err){
                    $.message = err.message;
                });
            }

         $.canMessage = function(){
                return $.sendMessageForm.$dirty && $.sendMessageForm.$valid;
         }
         
         $.sendMessage = function(){
             $http.post('/server/processMessage', {msg: $.msg})
             	.success(function(response){
                    $.message = response.msg;
               })
         }
    }])
    
    .controller('portfolioHomeCtrl', ['$scope', '$routeParams', function($scope, $routeParams){
           $scope.portfolio = $routeParams.portfolio;
       
    }])
    .controller('adminCtrl', 
               ['$scope', 
                '$routeParams',
                '$filter',
                '$rootScope',
                '$location',
                'trademarks', 
                'trademarkReviser',
                'geoJson',
                'world',
                'user',
                'userGetter',
                'chartGetter', 
                'barChartData',
                'barChartOptions',
                '$moment',
                'trademarkModal',
                'menuModal',
                '$http', 
       
        function($scope, 
                 $routeParams,
                 $filter,
                 $rootScope, 
                 $location,
                 trademarks,
                 trademarkReviser,
                 geoJson,
                 world,
                 user,
                 userGetter,
                 chartGetter, 
                 barChartData,
                 barChartOptions,
                 $moment, 
                 trademarkModal,
                 menuModal,
                 $http){
                     
            var $ = $scope;
			
            $.toggleMenuModal = function(){
            	trademarkModal.deactivate();
		if (!$rootScope.menuModal){
			$rootScope.menuModal = true;
			menuModal.activate({ activePortfolio: $.activePortfolio});
		}
		else {
			$rootScope.menuModal = false;
			menuModal.deactivate();	
		}

            };
            
            $http.get('/api/countryData?portfolio=' + $routeParams.portfolio)
            	.success(function(countries){
                    $.countries = $filter('orderBy')(countries, 'name');
	        })

            $.$on('country.click', function(e, l){
                $.$apply(function(){
                    $location.path('/admin/country/' + $routeParams.portfolio).search('country', l.target.feature.id);
                })
            })
            
            $.showGroup = function(group){
            	
                trademarkReviser.getGroup($routeParams.portfolio, group.name).then(function(trademarks){
                
                    $.trademarks = trademarks;
                })
                geoJson.getWorldGroup($routeParams.portfolio, group.name).then(function(geojson){
                    $.geojson = geojson;
                })
                chartGetter.barChartDataForGroup($routeParams.portfolio, group.name).then(function(barChartData){
                    $.chart = barChartData;
                })
                $.marks = $filter('unTickAllExceptSelected')($.marks, group);
                $.activeMark = group.name;

            }
            
            $.showModal = function(trademark){
                $rootScope.modal = true;
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark, user: $rootScope.user });
            };
            
            $.expiryFormValid = function(){
                 return $.expiryForm.$dirty && $.expiryForm.$valid;
            };
        
            $.activePortfolio = $routeParams.portfolio;
            $.geojson = world;
            $.trademarks = trademarks;
            $.user = user;
            $.marks = $filter('orderBy')($filter('groupByMarks')(trademarks), 'name');
            $.marks.unshift({ name: "ALL MARKS" })
            $.chart = barChartData;
            $.options = barChartOptions;
            
            $.sendMarksToServer = function(marks){
                $http.post('/api/world/' + $routeParams.portfolio, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(world){
                         $.geojson = world;
                     }); 
                 }

            $.goToGroup = function(obj){
            	$location.path('/admin/group/' + $routeParams.portfolio).search('group', obj.name);
            }
            
            $.goToCountry = function(obj){
                $location.path('/admin/country/' + $routeParams.portfolio).search('country', obj.alpha3);
            }
            
            $.$watch('trademarks', function(trademarks){
                if (!trademarks){ return; }
                
                $.incompleteMarks = $filter('incompleteMarks')(trademarks);
                $.sortedByExpiry = $filter('fromNow')($filter('sortByExpiryDate')($filter('extractRegisteredMarks')(trademarks)));
                $.pieData = chartGetter.pieChartData(trademarks);
                $.pieOptions = chartGetter.pieChartOptions();
                $.chartSubtitles = chartGetter.pieChartSubtitles(trademarks);
            });
            
             $.expirySearch = function(year){
                 $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + year)
            };

            $.min = new Date().getFullYear();
        }])

    .controller('uploadCtrl', ['$scope', '$location', 'userGetter', '$timeout', function($scope, $location, userGetter, $timeout){
        var $ = $scope;
        $.uploadComplete = function (content) {
            if (content.err){
                $.response = content.err;
            }
            else {
             $.response = content.msg; 
             $timeout(function(){
                 $location.path('/select-portfolio')
             }, 1000)
            }
         }
        
      $scope.loading = function() {
          console.log('loading...');
      }
      
        $.uploadFormValid = function(){
             return $.uploadForm.$dirty && $.uploadForm.$valid;
        };
    }])

	.controller('trademarkViewCtrl', 
	['$scope', '$rootScope', '$routeParams', 'trademarkReviser', 'editTrademarkModal', 'trademarkModal', 
	function($scope, $rootScope, $routeParams, trademarkReviser, editTrademarkModal, trademarkModal){
	        var $ = $scope;
	        trademarkReviser.getTrademark($routeParams.id).then(function(data){
	            $.trademark = data;
	            $.alpha2 = data.country.alpha2.toLowerCase();
	        });
	        
	        $.openEditTrademarkModal = function(){
	                editTrademarkModal.activate({trademark: $.trademark});
	                $rootScope.modal = true;
	            }
	          
	        $.deleteTrademark = function(){
	            trademarkReviser.deleteMark($.trademark)
	               .success(function(data){
	                   $scope.message = data.message;
	               })
	           }
         }])
         
        .controller('groupViewCtrl', 
		['$scope', '$rootScope', '$location', '$filter', '$http', '$routeParams', 'geoJson', 'trademarkReviser', 'editTrademarkModal', 'trademarkModal', 'editGroupModal', 'uploadImageModal',
		function($scope, $rootScope, $location, $filter, $http, $routeParams, geoJson, trademarkReviser, editTrademarkModal, trademarkModal, editGroupModal, uploadImageModal){
	        var $ = $scope;
	        geoJson.getWorldGroup($routeParams.portfolio, $location.search().group).then(function(data){
	            $.geojson = data;
	        });
        
            trademarkReviser.getGroup($routeParams.portfolio, $routeParams.group).then(function(data){
            	$.title = $location.search().group;
                $.trademarks = data;
                $.chartSubtitles = $filter('groupByStatus')($.trademarks);
            });
         
           trademarkReviser.getListOfMarks($routeParams.portfolio)
 		     .then(function(response){
 			$.marks = response;
 		})
	        
        $.showModal = function(trademark){
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark });
          };
            
            $.showEditGroupModal = function(){
                $rootScope.modal = true;
                var mark = $.trademarks[0].mark;
                editGroupModal.activate({ trademark: $.trademarks[0], mark: mark, portfolio: $routeParams.portfolio });
            }

            $.goToGroup = function(obj){
            	$location.search('group', obj.name);
            	$.title = $location.search().group;
            	geoJson.getWorldGroup($routeParams.portfolio, obj.name).then(function(data){
	            $.geojson = data;
	        });
            	trademarkReviser.getGroup($routeParams.portfolio, obj.name).then(function(data){
                    $.trademarks = data;
        	    $.chartSubtitles = $filter('groupByStatus')($.trademarks);
            	});
            	
            	
            }
            
            $.showUploadImageModal = function(){
                $rootScope.modal = true;
                var id = $.trademarks[0].mark;
                uploadImageModal.activate({ id: id });
            };

	        $.$on('country.click', function(e, l){
	            $.registered = false;
	            $.pending = false;
	            $.published = false;
	            $.nocontent = true;
	            $.$apply(function(){
	                $.country = l.target.feature.properties.name;
	                $.alpha2 = l.target.feature.alpha2.toLowerCase();
	                $.alpha3 = l.target.feature.id;
	               
	                var tms = l.target.feature.properties.trademarks;
	                if (tms){
	                    $.nocontent = false;
	                    if (tms.Registered)
	                        $.registered = tms.Registered;
	
	                    if (tms.Published)
	                        $.published = tms.Published;
	
	                    if (tms.Pending)
	                         $.pending = tms.Pending;
	                  }
	        
	             });
	        });
          
         }])

	.controller('countryViewCtrl', 
		['$scope', '$rootScope', '$location', '$filter', '$http', '$routeParams', 'geoJson', 'trademarkReviser', 'editTrademarkModal', 'trademarkModal', 'editCountryModal', 
		function($scope, $rootScope, $location, $filter, $http, $routeParams, geoJson, trademarkReviser, editTrademarkModal, trademarkModal, editCountryModal){
	        var $ = $scope;
        
            trademarkReviser.getCountry($routeParams.portfolio, $location.search().country).then(function(trademarks){
                $.trademarks = trademarks;
                $.trademark = trademarks[0];
                $.countries = $filter('extractCountries')($.trademarks);
                if (_.every($.countries, function(c){ return c === "European Union"})){
                         $.country = "European Union";
                }
                else {
                    $.country = _.without($.countries, "European Union")[0];
		    }
            });

	    trademarkReviser.getListOfMarks($routeParams.portfolio, $location.search().country)
	    	.then(function(list){
	    		$.marks = list;
	    	})
         
            $.$watch('trademarks', function(data){
                if (!data){
                    return;
                }
                $.nocontent = true;
                $.registered = false;
                $.published = false;
                $.pending = false;
                
                $.countryTM = data[0];
                $.sortedByStatus = _.groupBy(data, 'status');
                $.chartSubtitles = $filter('groupByStatus')(data);
                
                $.nocontent = false;

                if ($.sortedByStatus.Registered)
                     $.registered = $.sortedByStatus.Registered;
                if ($.sortedByStatus.Published)
                     $.published = $.sortedByStatus.Published;
                if ($.sortedByStatus.Pending)
                     $.pending = $.sortedByStatus.Pending;
            })
	        
	        $.showModal = function(trademark){
	            $rootScope.modal = true;
	            trademarkModal.deactivate();
	            trademarkModal.activate({ trademark: trademark });
	          };
            
            $.sendMarksToServer = function(marks){
                $http.post('/api/country/' + $routeParams.portfolio + "/" + $location.search().country, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(trademarks){
                         $.trademarks = trademarks;
                     }); 
             }
            
            $.showEditCountryModal = function(){
                $rootScope.modal = true;
                editCountryModal.activate({ trademark: $.countryTM, iso: $location.search().country, portfolio: $routeParams.portfolio });
            };
          
         }])

	.controller('expiryCtrl', 
        ['$scope', '$rootScope',  '$routeParams', '$location', 'geoJson', 'editTrademarkModal', 'trademarkModal', 
         function($scope, $rootScope, $routeParams, $location, geoJson, editTrademarkModal, trademarkModal){
        var $ = $scope;
        geoJson.getExpiriesForYear($routeParams.portfolio, $routeParams.year).success(function(geojson){
              $.geojson = geojson;
        });
             
        $.$on('country.click', function(e, l){
            $.registered = false;
            $.nocontent = true;
            $.$apply(function(){
                $.country = l.target.feature.properties.name;
                $.countrycode = l.target.feature.alpha2.toLowerCase();
               
                var tms = l.target.feature.properties.trademarks;
                if (tms){
                    $.nocontent = false;
                    if (tms.Registered)
                        $.registered = tms.Registered;
                  }
        
             });
        });
             
        $.showModal = function(trademark){
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark });
          };
        
        $.expiryFormValid = function(){
            return $.expiryForm.$dirty && $.expiryForm.$valid;
        };
        
        $.changeYear = function(){
            $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + $.year)
        };
             
        $.min = new Date().getFullYear();

    }])

     .controller('passwordCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$location', function($scope, $routeParams, $http, $timeout, $location){
        var $ = $scope;

        $.changePasswordFormValid = function(){
            return $.changePasswordForm.$dirty && $.changePasswordForm.$valid;
        };

        $.changePassword = function(){
            if ($.newPassword != $.duplicatePassword){
                $.message = "The two passwords don't match!";
            }
            $http.post('/server/passwordReset/' + $routeParams.id, { newPassword: $.newPassword, duplicatePassword: $.duplicatePassword})
                .success(function(){
                    $.message = "Password updated";
                    $timeout(function(){
                        $location.path('/login'); 
                    }, 2000);
                })
                .error(function(){

                })
            }
    }])

     .controller('passwordResetCtrl', ['$scope', '$http', function($scope, $http){
        var $ = $scope;

        $.passwordResetFormValid = function(){
                 return $.passwordResetForm.$dirty && $.passwordResetForm.$valid;
        };

        $.requestPasswordReset = function(){
            $http.post('/server/requestPasswordReset', { email: $.email })
                .success(function(){
                    $.message = "If the above email address is in our database, you have been sent an email allowing you to change your password";
                })
            }
    }])


    .controller('addCtrl', ['$scope', '$http', 'trademarkReviser',
        function($scope, $http, trademarkReviser){
            var $ = $scope;
            $http.get('/api/countrydata')
                .success(function(data){
                    $.countrydata = data;
                })

            $.addTrademark = function(trademark){
                trademarkReviser.addMark(trademark)
                    .success(function(data){
                        $.message = data.message;
                    })
                }
            $.canAddTrademark = function(){
                 return $.addTrademarkForm.$dirty && $.addTrademarkForm.$valid;
            }
        }])

    .controller('createUserCtrl', ['$scope', '$http', '$location',
        function($scope, $http, $location){
            var $ = $scope;
            $.createUser = function(){
                $http.post('/api/addUser', $.newUser)
                    .success(function(){
                        $location.path('/')
                    })
                    .error(function(data){
                        $.message = data.message;
                    })
            }

            $.canSubmitCreateUser = function(){
                return $.createUserForm.$dirty && $.createUserForm.$valid;
            }
        }])

	.controller('createAccountCtrl', ['$scope', '$rootScope', '$http', '$location', 'userGetter',
        function($scope, $rootScope, $http, $location, userGetter){
            var $ = $scope;
            $.createUser = function(){
                $http.post('/api/createAccount', $.newUser)
                    .success(function(){
                        $location.path('/')
                    })
                    .error(function(data){
                        $.message = data.message;
                    })
            }

            $.canSubmitCreateUser = function(){
                return $.createUserForm.$dirty && $.createUserForm.$valid;
            }
           
        }])

    .controller('selectPortfolioCtrl', ['$scope', '$location', 'userGetter', '$rootScope',
        function($scope, $location, userGetter, $rootScope){
            var $ = $scope;
            userGetter.getUser().then(function(response){
                $.portfolios = response.portfolios;
            })

        }])

    .controller("mapCtrl", ['$scope', '$routeParams', '$filter', '$rootScope', 'world', 'trademarks', '$http', 'editTrademarkModal', 'trademarkModal',
        function($scope, $routeParams, $filter, $rootScope, world, trademarks, $http, editTrademarkModal, trademarkModal) {
        var $ = $scope;

        $.geojson = world;
        $.marks = $filter('groupByMarks')(trademarks);
        $.marks.unshift({ name: "ALL MARKS" });
        $.sendMarksToServer = function(marks){
                $http.post('/api/world/' + $routeParams.portfolio, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(world){
                         $.geojson = world;
                     }); 
                 }

        $.canFilter = function(){
            return $.filterTMsForm.$dirty && $.filterTMsForm.$valid;
        }

        $.$on('country.click', function(e, l){
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            $.$apply(function(){
                $.country = l.target.feature.properties.name;
                $.countrycode = l.target.feature.alpha2.toLowerCase();
               
                var tms = l.target.feature.properties.trademarks;
                if (tms){
                    $.nocontent = false;
                    if (tms.Registered)
                        $.registered = tms.Registered;

                    if (tms.Published)
                        $.published = tms.Published;

                    if (tms.Pending)
                         $.pending = tms.Pending;
                  }
        
             });
        });

        $.filterPortfolio = function(){
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            _.each($.geojson, function(feature){
                if ($.searchcountry.toLowerCase() === feature.properties.name.toLowerCase()){
                    var tms = feature.properties.trademarks;
                    $.country = feature.properties.name;
                    $.countrycode = feature.alpha2.toLowerCase();

                    if (tms){
                        $.nocontent = false;
                        if (tms.Registered)
                            $.registered = tms.Registered;
                        if (tms.Published)
                            $.published = tms.Published;
                        if (tms.Pending)
                            $.pending = tms.Pending;
                        }
                    }
                });
            }
                      
        $.showModal = function(trademark){
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark });
          };

    }]);
