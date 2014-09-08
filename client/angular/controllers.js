angular.module('app')
	    .controller('favouritesCtrl', ['$scope', '$rootScope', 'favourites', 'user', 'trademarkService', 'editTrademarkModal', function($scope, $rootScope, favourites, user, trademarkService, editTrademarkModal){
	        var $ = $scope;
	        $.favourites = favourites;
	        if (favourites.length === 0){
	             $.favourites = false;
	        }
	        $.user = user;
	        $.activeTrademark = favourites[0];
	        $.activateTrademark = function(trademark){
	        	$.activeTrademark = trademark;
	        }
	        
	        $.openEditTrademarkModal = function(trademark){
	                editTrademarkModal.activate({trademark: trademark});
	                $rootScope.modal = true;
	            }
	          
	        $.deleteTrademark = function(){
	            trademarkService.deleteMark($.trademark)
	               .success(function(data){
	                   $scope.message = data.message;
	               })
	           }
	    }])
	

 	.controller('quickSearchCtrl', ['$scope', '$filter', '$http', '$routeParams', '$location', 'trademarkService', function($scope, $filter, $http, $routeParams, $location, trademarkService){
 	    var $ = $scope;
 	    $http.get('/api/countryData')
            .success(function(countries){
                $.countrydata =  $filter('orderBy')(countries, 'name');
            })

        trademarkService.getListOfMarks($routeParams.portfolio)
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

     .controller('landingPageCtrl', ['$scope', '$window',  'userService', '$location', '$rootScope', function($scope, $window, userService, $location, $rootScope){
       var $ = $scope;
       $.loadDemo = function(){
            userService.logIn({ password: "demo", email: "demo@demo.com" })
                .then(function(res){
                    $window.sessionStorage.token = res.data.token;
                    $rootScope.user = true;
                    $location.path('/home/ACME INC');
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
    
    .controller('portfolioHomeCtrl', ['$scope', 'user', '$window', '$rootScope', '$filter','$routeParams', 'countries', 'marks', '$location', 
        function($scope, user, $window, $rootScope, $filter, $routeParams, countries, marks, $location){
           var $ = $scope;
           $.portfolios = user.portfolios;
           $.portfolio = $routeParams.portfolio;
           $.countries = $filter('orderBy')(countries, 'name');
           $.marks = marks;

           $.changePortfolio = function(portfolio){
                if (portfolio === null){
                    return;
                }
                $.portfolio = portfolio;
                $location.path('/home/' + portfolio);
            }

            $.goToGroup = function(country){
            	$location.path('/admin/group/' + $routeParams.portfolio).search('group', country.name);
            }
            
            $.goToCountry = function(country){
                $location.path('/admin/country/' + $routeParams.portfolio).search('country', country.alpha3);
            }
            
            $.logout = function(){
                $rootScope.user = false;
                delete $window.sessionStorage.token;
                $location.path('/');
            }
       
    }])
    .controller('adminCtrl', 
               ['$scope', 
                '$routeParams',
                '$filter',
                '$rootScope',
                '$location',
                'activities',
                'trademarks', 
                'trademarkService',
                'geoJsonService',
                'world',
                'countries',
                'user',
                'userService',
                'chartService', 
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
                 activities,
                 trademarks,
                 trademarkService,
                 geoJsonService,
                 world,
                 countries,
                 user,
                 userService,
                 chartService, 
                 barChartData,
                 barChartOptions,
                 $moment, 
                 trademarkModal,
                 menuModal,
                 $http){
                     
            var $ = $scope;
            $.activePortfolio = $routeParams.portfolio;
            $.geojson = world;
            $.trademarks = trademarks;
            $.allTrademarks = trademarks;
            $.favouriteMarks = $filter('extractFavourites')(trademarks);
            $.user = user;
            $.marks = $filter('orderBy')($filter('groupByMarks')(trademarks), 'name');
            $.marks.unshift({ name: "ALL MARKS" })
            $.chart = barChartData;
            $.options = barChartOptions;
            $.activities = activities;
            console.log(activities);
   
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

            $.countries = $filter('orderBy')(countries, 'name'); 

            $.$on('country.click', function(e, l){
                $.$apply(function(){
                    $location.path('/admin/country/' + $routeParams.portfolio).search('country', l.target.feature.id);
                })
            })
            
            $.showGroup = function(group){
                if (group === null){ return};
                $.trademarks = $filter('extractGroup')($.allTrademarks, group.name);
                geoJsonService.getWorldGroup($routeParams.portfolio, group.name).then(function(geojson){
                    $.geojson = geojson;
                });
                chartService.barChartDataForGroup($routeParams.portfolio, group.name).then(function(barChartData){
                    $.chart = barChartData;
                });
                $.marks = $filter('unTickAllExceptSelected')($.marks, group);
                $.activeMark = group.name;

            }
            
            $.showCountry = function(country){
                if (country === null){ return};
                $.trademarks = $filter('extractMarksInCountry')($.allTrademarks, country.alpha3);
                geoJsonService.getCountry($routeParams.portfolio, country.alpha3).then(function(geojson){
                    $.geojson = geojson;
                });
                
                chartService.barChartDataForCountry($routeParams.portfolio, 'ALL MARKS', country.alpha3).then(function(barChartData){
                    $.chart = barChartData;
                })
                
                //$.marks = $filter('unTickAllExceptSelected')($.marks, country);
                $.activeMark = country.name;
            }
            
            $.showModal = function(trademark){
                $rootScope.modal = true;
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark, user: user });
            };
            
            $.expiryFormValid = function(){
                 return $.expiryForm.$dirty && $.expiryForm.$valid;
            };
            
            $.sendMarksToServer = function(marks){
                $http.post('/api/world/' + $routeParams.portfolio, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(world){
                         $.geojson = world;
                     }); 
                 }

            $.goToGroup = function(country){
            	$location.path('/admin/group/' + $routeParams.portfolio).search('group', country.name);
            }
            
            $.goToCountry = function(country){
                $location.path('/admin/country/' + $routeParams.portfolio).search('country', country.alpha3);
            }
            
            $.$watch('trademarks', function(trademarks){
                if (!trademarks){ return; }
                
                $.incompleteMarks = $filter('incompleteMarks')(trademarks);
                $.sortedByExpiry = $filter('fromNow')($filter('sortByExpiryDate')($filter('extractRegisteredMarks')(trademarks)));
                $.pieData = chartService.pieChartData(trademarks);
                $.pieOptions = chartService.pieChartOptions();
                $.chartSubtitles = chartService.pieChartSubtitles(trademarks);
            });
            
            $.expirySearch = function(year){
                 $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + year)
            };

            $.min = new Date().getFullYear();
        }])

    .controller('uploadCtrl', ['$scope', '$location', 'userService', '$timeout', function($scope, $location, userService, $timeout){
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
	['$scope', '$rootScope', '$routeParams', 'trademark', 'trademarkService', 'user', 'editTrademarkModal', 
	function($scope, $rootScope, $routeParams, trademark, trademarkServce, user, editTrademarkModal){
	        var $ = $scope;
	        $.trademark = trademark;
	        $.user = user;
	        $.openEditTrademarkModal = function(trademark){
	                editTrademarkModal.activate({trademark: trademark});
	                $rootScope.modal = true;
	        }
	          
	        $.deleteTrademark = function(){
	            trademarkService.deleteMark($.trademark)
	               .success(function(data){
	                   $scope.message = data.message;
	               })
	           }
         }])
         
        .controller('groupViewCtrl', 
		['$scope', '$rootScope', '$location', 'user', '$filter', '$http', '$routeParams', 'geoJsonService', 'trademarkService', 'editTrademarkModal', 'trademarkModal', 'editGroupModal', 'uploadImageModal',
		function($scope, $rootScope, $location, user, $filter, $http, $routeParams, geoJsonService, trademarkService, editTrademarkModal, trademarkModal, editGroupModal, uploadImageModal){
	        var $ = $scope;
	        geoJsonService.getWorldGroup($routeParams.portfolio, $location.search().group).then(function(data){
	            $.geojson = data;
	        });
        
            trademarkService.getGroup($routeParams.portfolio, $routeParams.group).then(function(data){
            	$.title = $location.search().group;
                $.trademarks = data;
                $.chartSubtitles = $filter('groupByStatus')($.trademarks);
            });
         
           trademarkService.getListOfMarks($routeParams.portfolio)
 		     .then(function(response){
 			$.marks = response;
 		})
	        
        $.showModal = function(trademark){
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark, user: user });
          };
            
            $.showEditGroupModal = function(){
                $rootScope.modal = true;
                var mark = $.trademarks[0].mark;
                editGroupModal.activate({ trademark: $.trademarks[0], mark: mark, portfolio: $routeParams.portfolio });
            }

            $.goToGroup = function(group){
            	$location.search('group', group.name);
            	$.title = $location.search().group;
            	geoJsonService.getWorldGroup($routeParams.portfolio, group.name).then(function(data){
	            $.geojson = data;
	        });
            	trademarkService.getGroup($routeParams.portfolio, group.name).then(function(data){
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
		['$scope', '$rootScope', '$location', 'user', '$filter', '$http', '$routeParams', 'geoJsonService', 'trademarkService', 'editTrademarkModal', 'trademarkModal', 
		function($scope, $rootScope, $location, user, $filter, $http, $routeParams, geoJsonService, trademarkService, editTrademarkModal, trademarkModal){
	        var $ = $scope;
	        $.portfolio = $routeParams.portfolio;
        
            trademarkService.getCountry($routeParams.portfolio, $location.search().country).then(function(trademarks){
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

	    trademarkService.getListOfMarks($routeParams.portfolio, $location.search().country)
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
	            trademarkModal.activate({ trademark: trademark, user: user });
	          };
            
            $.sendMarksToServer = function(marks){
                $http.post('/api/country/' + $routeParams.portfolio + "/" + $location.search().country, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(trademarks){
                         $.trademarks = trademarks;
                     }); 
             }
          
         }])

	.controller('expiryCtrl', 
        ['$scope', '$rootScope',  '$routeParams', '$location', 'geoJsonService', 'editTrademarkModal', 'trademarkModal', 
         function($scope, $rootScope, $routeParams, $location, geoJsonService, editTrademarkModal, trademarkModal){
        var $ = $scope;
        $.activeYear = $routeParams.year;
        geoJsonService.getExpiriesForYear($routeParams.portfolio, $routeParams.year).then(function(response){
              $.geojson = response.data;
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
            $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + $.year);
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


    .controller('addCtrl', ['$scope', '$http', 'trademarkService', '$routeParams',
        function($scope, $http, trademarkService, $routeParams){
            var $ = $scope;
            $http.get('/api/countrydata')
                .success(function(data){
                    $.countrydata = data;
                })

            $.addTrademark = function(trademark){
                trademarkService.addMark(trademark, $routeParams.portfolio)
                    .success(function(data){
                        $.message = data.message;
                    })
                }
            $.canAddTrademark = function(){
                 return $.addTrademarkForm.$dirty && $.addTrademarkForm.$valid;
            }
        }])

    .controller('createUserCtrl', ['$scope', '$http',
        function($scope, $http){
            var $ = $scope;
            $.createUser = function(){
                $http.post('/api/addUser', $.newUser)
                    .success(function(data){
                        $.message = data.msg;
                    })
                    .error(function(data){
                        $.message = data.msg;
                    })
            }

            $.canSubmitCreateUser = function(){
                return $.createUserForm.$dirty && $.createUserForm.$valid;
            }
        }])

	.controller('createAccountCtrl', ['$scope', '$rootScope', '$http', '$location', 'userService',
        function($scope, $rootScope, $http, $location, userService){
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

    .controller('selectPortfolioCtrl', ['$scope', 'user', 'notifications', 'trademarkModal',
        function($scope, user, notifications, trademarkModal){
            var $ = $scope;
            $.portfolios = user.portfolios;
            $.notifications = notifications;
            $.showModal = function(trademark){
	            $rootScope.modal = true;
	            trademarkModal.deactivate();
	            trademarkModal.activate({ trademark: trademark, user: user });
	    };
        }])

    .controller("mapCtrl", ['$scope','countryData','user', '$routeParams', '$filter', '$rootScope', 'world', 'trademarks', '$http', 'editTrademarkModal', 'trademarkModal',
        function($scope, countryData, user, $routeParams,  $filter, $rootScope, world, trademarks, $http, editTrademarkModal, trademarkModal) {
        var $ = $scope;
	    $.portfolio = $routeParams.portfolio;
        $.countries = $filter('orderBy')(countryData, 'name');
        $.geojson = world;
        $.marks = $filter('groupByMarks')(trademarks);
        $.marks.unshift({ name: "ALL MARKS" });

        $.sendMarksToServer = function(marks){
                $http.post('/api/world/' + $routeParams.portfolio, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(world){
                         $.geojson = world;
                     }); 
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

        $.showCountry = function(country){
            if (!country){
                return;
            }
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            _.each($.geojson, function(feature){
                if (country.alpha3 === feature.id){

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
            trademarkModal.activate({ trademark: trademark, user: user });
          };

    }]);
