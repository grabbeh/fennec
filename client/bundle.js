;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
angular.module('app')

    .controller("authCtrl", ['$scope', '$rootScope', '$http', 'trademarkReviser', 'pathHolder', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'uploadImageModal', 'userGetter',
        function($scope, $rootScope, $http, trademarkReviser, pathHolder, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, uploadImageModal, userGetter){
            var $ = $scope;
            $rootScope.$on('$routeChangeError', function(event, previous){
                var originalPath = previous.$$route.originalPath;
                if (previous.params.id){
                    originalPath = originalPath.replace(":id", previous.params.id);
                }
                pathHolder.insertPath(originalPath);
                
                userGetter.anyUsers().then(function(){
                    $location.path('/login');
                }, function(err){
                     $location.path('/create-account');
                });
            });
            
            $.loadingView = false;
            $.$on('$routeChangeStart', function() {
              $scope.loadingView = true;
            });
            $.$on('$routeChangeSuccess', function() {
              $scope.loadingView = false;
            });
            
            $.removeModalOverlay = function(){
                $rootScope.modal = false;
                trademarkModal.deactivate();
                editTrademarkModal.deactivate();
                editCountryModal.deactivate();
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
            }
            
            $.logout = function(){
                $http.get('/api/logout')
                    .success(function(){
                        userGetter.removeClientUser();
                        $.user = false;
                        $location.path('/');
                    })
            }
            
            userGetter.getUser().then(function(data){
                console.log(data);
                $rootScope.user = data;
            });
        
            $.isUser = function(){
                return !!$rootScope.user;
            }

        }])
    
    .controller("loginCtrl", ['$scope', '$rootScope', 'userGetter', 'pathHolder', '$http', '$location', 'trademarkReviser',
        function($scope, $rootScope, userGetter, pathHolder, $http, $location, trademarkReviser){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$dirty && $.loginForm.$valid;
            }
            
            $.login = function(){
                $http.post('/api/login', { password: $.password, username: $.username })
                    .success(function(){
                        userGetter.getUser().then(function(response){
                            userGetter.storeUser(response);
                            $rootScope.user = response;
                        });
                        if (pathHolder.existingPath){
                             $location.path(pathHolder.returnPath());
                        }
                        $location.path('/select-portfolio');
                       
                    })
                    .error(function(err){
                        $.message = err.message;
                    });
                }
        }]);

},{}],2:[function(require,module,exports){
angular.module('app')
    .controller('adminCtrl', 
               ['$scope', 
                '$routeParams',
                '$window',
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
                '$http', 
       
        function($scope, 
                 $routeParams,
                 $window,
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
                 $http){
                     
            var $ = $scope;
            
            $.getJSON = function(){
                $window.open('/api/downloadTrademarks/' + $routeParams.portfolio)
            };
            
            $http.get('/api/filteredCountryData/' + $routeParams.portfolio)
            	.success(function(countries){
                    $.countries = $filter('orderBy')(countries, 'name');
		        })

            $.$on('country.click', function(e, l){
                $.$apply(function(){
                    $location.path('/admin/country/' + $routeParams.portfolio + '/' + l.target.feature.id);
                })
            })
            
            $.showGroup = function(tm){
                trademarkReviser.getGroup($routeParams.portfolio, tm.name).then(function(trademarks){
                    $.trademarks = trademarks;
                })
                geoJson.getWorldGroup($routeParams.portfolio, tm.name).then(function(geojson){
                    $.geojson = geojson;
                })
                chartGetter.barChartDataForGroup($routeParams.portfolio, tm.name).then(function(barChartData){
                    $.chart = barChartData;
                })
                $.marks = $filter('unTickAllExceptSelected')($.marks, tm);
                $.activeMark = tm.name;
            }
            
            $.showModal = function(trademark){
                $rootScope.modal = true;
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark });
            };
            
            $.expiryFormValid = function(){
                 return $.expiryForm.$dirty && $.expiryForm.$valid;
            };
        
            $.activePortfolio = $routeParams.portfolio;
            $.geojson = world;
            $.trademarks = trademarks;
            $.user = user;
            $.marks = $filter('groupByMarks')(trademarks);
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
            	$location.path('/admin/group/' + $routeParams.portfolio + '/' + obj.name);
            }
            
            $.goToCountry = function(obj){
                $location.path('/admin/country/' + $routeParams.portfolio + '/' + obj.alpha3);
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
            
	        geoJson.getWorldGroup($routeParams.portfolio, $routeParams.group).then(function(data){
	            $.geojson = data;
	        });
        
            trademarkReviser.getGroup($routeParams.portfolio, $routeParams.group).then(function(data){
                $.trademarks = data;
                $.chartSubtitles = $filter('groupByStatus')($.trademarks);
            });
         
           $http.get('/api/listOfMarks/' + $routeParams.portfolio)
              .success(function(data){
                  $.marks = data;
              })
	        
	        $.showModal = function(trademark){
	            $rootScope.modal = true;
	            trademarkModal.deactivate();
	            trademarkModal.activate({ trademark: trademark });
	          };
            
            $.showEditGroupModal = function(){
                $rootScope.modal = true;
                var id = $.trademarks[0].mark;
                editGroupModal.activate({ trademark: $.trademarks[0], id: id });
            }

            $.goToGroup = function(obj){
            	$location.path('/admin/group/' + obj.name);
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
        
            trademarkReviser.getCountry($routeParams.portfolio, $routeParams.iso).then(function(trademarks){
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

            $http.get('/api/listOfMarks/' + $routeParams.portfolio + '/' + $routeParams.iso)
         	   .success(function(list){
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
                $http.post('/api/country/' + $routeParams.portfolio + "/" + $routeParams.iso, { marks: $filter('extractCheckedMarks')(marks) })
                     .success(function(trademarks){
                         $.trademarks = trademarks;
                     }); 
             }
            
            $.showEditCountryModal = function(){
                $rootScope.modal = true;
                editCountryModal.activate({ trademark: $.countryTM, id: $routeParams.id });
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
            $.trademarks = false;
            $.nocontent = true;
            $.$apply(function(){
                $.country = l.target.feature.properties.name;
                $.countrycode = l.target.feature.alpha2.toLowerCase();
               
                var tms = l.target.feature.properties.trademarks;
                if (tms){
                    $.nocontent = false;
                    if (tms.Registered)
                        $.trademarks = tms.Registered;
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
            $http.post('/api/passwordReset/' + $routeParams.id, { newPassword: $.newPassword, duplicatePassword: $.duplicatePassword})
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
            $http.post('/api/requestPasswordReset', { email: $.email })
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
                $http.post('/api/addUser', $.user)
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

	.controller('createAccountCtrl', ['$scope', '$http', '$location', 'userGetter',
        function($scope, $http, $location, userGetter){
            var $ = $scope;
            $.createUser = function(){
                $http.post('/api/createAccount', $.user)
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
            
            $.loadDemo = function(){
                $http.post('/api/login', { password: "demo", username: "demo@demo.com" })
                    .success(function(){
                        userGetter.getUser().then(function(response){
                            userGetter.storeUser(response); 
                        });

                        $location.path('/demo/ACME INC');
                       
                    })
                    .error(function(err){
                        $.message = err.message;
                    });
                }
        }])

    .controller('selectPortfolioCtrl', ['$scope', '$location', 'userGetter', '$rootScope',
        function($scope, $location, userGetter, $rootScope){
            var $ = $scope;
            $.portfolios = userGetter.returnUser().portfolios;

            $.goToPortfolio = function(portfolio){
                $location.path('/admin/' + portfolio);
            }
        }])

    .controller("mapCtrl", ['$scope', '$filter', '$rootScope', 'world', 'trademarks', '$http', 'editTrademarkModal', 'trademarkModal',
        function($scope, $filter, $rootScope, world, trademarks, $http, editTrademarkModal, trademarkModal) {
        var $ = $scope;

        $.geojson = world;
        $.marks = $filter('groupByMarks')(trademarks);
        $.marks.unshift({ name: "ALL MARKS" });
        $.sendMarksToServer = function(marks){
            $http.post('/api/world', { marks: $filter('extractCheckedMarks')(marks) })
                 .success(function(world){
                     $.geojson = world;
                 }); 
             }

        $.canFilter = function(){
            return $.filterTMsForm.$dirty && $.filterTMsForm.$valid;
        }

        $.$on('country.click', function(e, l){
            $.trademarks = false;
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
                        $.trademarks = tms.Registered;

                    if (tms.Published)
                        $.published = tms.Published;

                    if (tms.Pending)
                         $.pending = tms.Pending;
                  }
        
             });
        });

        $.filterPortfolio = function(){
            $.trademarks = false;
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
                            $.trademarks = tms.Registered;
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

},{}],3:[function(require,module,exports){
angular.module('app')

    .directive('mgMap', function($rootScope) {
    return {
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            map = L.mapbox.map(attrs.id, 'grabbeh.gch0omlb',{
                center: [33, 31],
                zoom: 2,
                minZoom: 1
            });

            function updateGeoJson(world){
                if ($rootScope.l){ map.removeLayer($rootScope.l); }
                $rootScope.l = L.geoJson(world, 
                    { 
                style: function(feature) {
                    switch (feature.properties.status){
                        case false : return {  "color": "white", "weight": 1, "opacity":0};
                        case "only pending" : return {  "color": "red", "weight": 1, "opacity":1};
                        case "only published" : return {  "color": "red", "weight": 1, "opacity":1};
                        case "pending published" : return {  "color": "red", "weight": 1, "opacity":1};
                        case "only registered" : return {  "color": "green", "weight": 1, "opacity": 100};
                        case "registered pending published" : return {  "color": "green", "weight": 1, "opacity": 100};
                        case "registered published" : return {  "color": "green", "weight": 1, "opacity": 100};
                        case "registered pending" : return {  "color": "green", "weight": 1, "opacity": 100};
                    }
                },
                onEachFeature: function (feature, layer) {
                     layer.on('click', function(e){
                        $rootScope.$broadcast('country.click', e);
                    })
                }})
                $rootScope.l.addTo(map)
            }

            scope.$watch(attrs.geojson, function(world){
                if (!world){
                  return;
                }
                updateGeoJson(world);
            })

        }
    };
})

 .directive('mgClear', function() {
    return {
      compile: function(element){
          element.addClass('clear')
      }
    };
  })
  
  .directive('mgBold', function() {
    return {
      compile: function(element){
          element.addClass('bold')
      }
    };
  })


  .directive('mgSearchResult', function(){
      return {
          templateUrl: '/partials/search-results.html',
          restrict: 'A'
    };

  })

  .directive('mgPaginator', function() {
      return {
            templateUrl: "/partials/admin-expiry.html",
            replace: true, 
            link: function(scope, elements, attrs){
                 var $ = scope;
                 $.$watch(attrs.sortedByExpiry, function(newVal){
                      if (!newVal){
                          return;
                      }
                      $.groupOfArrays = [];
                      
                      
                      for (var i=0; i < newVal.length; i+= $.itemsPerPage) {
                           var slice = newVal.slice(i, i+ $.itemsPerPage);
                           $.groupOfArrays.push(slice);
                      }
                      $.items = $.groupOfArrays[0];
                      
                      $.pageNumber = 1;
                 })

                  $.$watch('pageNumber', function(newPage){
                      $.items = $.groupOfArrays[newPage -1];
                  })
            },
            scope: {
                sortedByExpiry: '=',
                itemsPerPage: '=',
                showModal: '&'
            },
            controller: function($scope) {
                var $ = $scope;
                $.groupOfArrays = [];
                $.prevPage = function(pageNumber){
                    $.pageNumber--;
                };
                $.nextPage = function(pageNumber){
                    $.pageNumber++;
                };
                $.firstPage = function(){
                    $.pageNumber = 1;
                };
                $.lastPage = function(){
                    $.pageNumber = $.groupOfArrays.length;
                };
                $.checkIfFirst = function(pageNumber){
                    if (pageNumber === 1){
                      return true;
                    }
                };
                $.checkIfLast = function(pageNumber){
                   if (pageNumber === $.groupOfArrays.length){
                      return true;
                   }
                };
                $.showModalWrapper = function(tm){
                    var func = $.showModal();
                    func(tm);
                }
          }
      }
})

.directive('mgIncompletePaginator', function() {
      return {
            templateUrl: "/partials/admin-incomplete.html",
            replace: true, 
            link: function(scope, elements, attrs){
                var $ = scope;
                 $.$watch('incompleteMarks', function(newVal){
                      if (!newVal){
                          return;
                      }
                     $.groupOfArrays = [];
                    
                     
                      for (var i=0; i < newVal.length; i+= $.itemsPerPage) {
                           var slice = newVal.slice(i, i+ $.itemsPerPage);
                           $.groupOfArrays.push(slice);
                      }
                      $.items = $.groupOfArrays[0];
                      $.pageNumber = 1;
                 })

                  $.$watch('pageNumber', function(newPage){
                      $.items = $.groupOfArrays[newPage -1];
                  })
            },
            scope: {
                incompleteMarks: '=',
                itemsPerPage: '=',
                showModal: '&'
            },
            controller: function($scope) {
                var $ = $scope;
                $.groupOfArrays = [];
                $.prevPage = function(pageNumber){
                    $.pageNumber--;
                };
                $.nextPage = function(pageNumber){
                    $.pageNumber++;
                };
                $.firstPage = function(){
                    $.pageNumber = 1;
                };
                $.lastPage = function(){
                    $.pageNumber = $scope.groupOfArrays.length;
                };
                $.checkIfFirst = function(pageNumber){
                    if (pageNumber === 1){
                      return true;
                    }
                };
                $.checkIfLast = function(pageNumber){
                   if (pageNumber === $scope.groupOfArrays.length){
                      return true;
                   }
                };
                $.showModalWrapper = function(tm){
                    var func = $scope.showModal();
                    func(tm);
                }
          }
      }
    })
    
    .directive('tabs', function() {
    return {
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        var panes = $scope.panes = [];
 
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }
 
        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      },
      template:
        '<div class="tabbable">' +
          '<ul class="tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{activepane:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  })
 
  .directive('pane', function() {
    return {
      require: '^tabs',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{ activetab: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  })


  .directive('mgSearchInput', function() {
        return {
            templateUrl: "/partials/search-input.html",
            replace: true, 
            scope: {
                searchResults: '='
            },
            controller: function($scope, $http) {
                var $ = $scope;
                $.search = function(){
                    $http.post('/api/search', { query: $.query })
                        .success(function(data){
                            if (data.length === 0){
                                $.noresults = true;
                                $.searchResults = false;
                            }
                            else {
                                $.noresults = false;
                                $.searchResults = data;
                            }
                        })
                        .error(function(){
                            // deal with error handling
                        });
                }

            $.canSearch = function(){
                 return $.searchForm.$dirty && $.searchForm.$valid;
            }

            $.canExpirySearch = function(){
                 return $.expiryForm.$dirty && $.searchForm.$valid;
            }

            $.removeNoResults = function(){
                $.noresults = false;
            }
        }
    }
})
  
  .directive('mgSearchResults', function() {
      return {
            replace: true, 
            templateUrl: '/partials/search-results.html',
            scope: {
                searchResults: '=',
                showModal: '&'
            },
            controller: function($scope) {
                var $ = $scope;
                $.removeResults = function(){
                    $.searchResults = false;
                }
                $.showModalWrapper = function(trademark){
                    var func = $.showModal();
                    func(trademark);
                }

          }
      }
})

    .directive('mgAdminAlertWidget', function() {
      return {
            replace: true, 
            templateUrl: '/partials/admin-alert.html',
            scope: {
                user: '='
            },
            link: function($scope){
                var $ = $scope;
                $.$watch('user.alertFrequency', function(frequency){
                     if (!frequency){
                         return;
                     }
                      $.user.alertOptions.forEach(function(option, i){
                           if (option.functionName === "sendExpiryAlerts"){ 
                                 if (frequency.length > 0){
                                     $.user.alertOptions[i].checked = true;
                                 }
                                 else {
                                     $.user.alertOptions[i].checked = false;
                                 }
                              }
                         })
                     })
            },
            controller: function($scope, $http) {
                var $ = $scope;
                    
                $.alert = {};
                $.alert.number = "";
                $.alert.type = "";
                $.number = "";
                $.types = ["days", "weeks", "months", "years"];

                $.removeAlert = function(index){
                    $.user.alertFrequency.splice(index, 1);
                    $.updateAlerts($.user);
                } 

                $.addAlert = function(alert){
                    if (alert.number === ""){
                        $.message = "Please provide a number";
                        $.alert.type = "";
                        return;
                    }
                    $.user.alertFrequency.push({type: alert.type, number: alert.number});
                    $.updateAlerts($.user);
                    $.number = "";
                    $.message = "";
                }

                $.updateAlerts = function(user){
                     $http.post('/api/updateAlert', user)
                        .success(function(data){
                             $.alert.type = "";
                             $.alert.number = "";
                             $.user = data;
                        })
                    }

          }
      }
})

    .directive('mgAccountDetailsWidget', function() {
      return {
            replace: true, 
            templateUrl: '/partials/account-details.html',
            scope: {
                user: '='
            },
            controller: function($scope, $http) {
                var $ = $scope;
                 $.updatePassword = function(old, nnew, dup){
                 if (nnew != dup){
                    $.passwordMessage = "New password and duplicate don't match";
                    return;
                 }
                 var load = { oldPW: old, newPW: nnew };
                 $http.post('/api/updatePassword', load)
                    .success(function(data){
                        $.passwordMessage = data.message;
                    })
                    .error(function(data){
                         $.passwordMessage = data.message;
                    })
                 }

          }
      }
})

 .directive('mgGroupSelector', function() {
      return {
            replace: true, 
            templateUrl: '/partials/group-selector.html',
            scope: {
                marks: '=',
                goToGroup: '&',
                title: '@'
            },
            controller: function($scope) {
                var $ = $scope;
                $.goToGroupWrapper = function(obj){
                    var func = $.goToGroup();
                    func(obj);
                }
          }
      }
})


 .directive('mgCountrySelector', function() {
      return {
            replace: true, 
            templateUrl: '/partials/country-selector.html',
            scope: {
                countries: '=',
                goToGroup: '&',
                title: '@'
            },
            controller: function($scope) {
                var $ = $scope;
                $.goToGroupWrapper = function(obj){
                    var func = $.goToGroup();
                    func(obj);
                }
          }
      }
})

 .directive('mgMarkListDisplayer', function() {
      return {
            templateUrl: '/partials/mark-list-displayer.html',
            scope: {
                marks: '=',
                sendMarksToServer: '&'
            },
            controller: function($scope, $filter, $http) {
                var $ = $scope;
                
                $.markServerWrapper = function(){
                    var func = $.sendMarksToServer();
                    func($.marks);
                }
                
                $.filterMarks = function(marks){
                    $.markServerWrapper($.marks);
                };

                $.toggleMark = function(index){
                    angular.forEach($.marks, function(mark, i){
                        if (index === i){
                            mark.checked = !mark.checked;
                        }
                    })
                    $.markServerWrapper($.marks);
                }

                $.untickAll = function(){
                    $filter('untickAll')($.marks);
                    $.markServerWrapper($.marks);
                }

                $.tickAll = function(){
                    $filter('tickAll')($.marks);
                    $.markServerWrapper($.marks);
                };

          }
      }
})

  


},{}],4:[function(require,module,exports){
angular.module('app')

  .factory('trademarkModal', ['btfModal', function (btfModal) {
    return btfModal({
      controller: 'trademarkModalCtrl',
      templateUrl: '/modals/trademark-modal.html'
    });
  }])

  .factory('editTrademarkModal', ['btfModal', function (btfModal) {
    return btfModal({
      controller: 'editTrademarkModalCtrl',
      templateUrl: '/modals/edit-trademark-modal.html'
    });
  }])

  .factory('editGroupModal', ['btfModal', function (btfModal) {
    return btfModal({
      controller: 'editGroupCtrl',
      templateUrl: '/modals/edit-group-modal.html'
    });
  }])

    .factory('editCountryModal', ['btfModal', function (btfModal) {
        return btfModal({
          controller: 'editCountryCtrl',
          templateUrl: '/modals/edit-country-modal.html'
        });
      }])

	.factory('uploadImageModal', ['btfModal', function(btfModal){
        return btfModal({     
            controller: 'uploadImageCtrl',
            templateUrl: '/modals/upload-image-modal.html'
        });
    }])

  .factory('userGetter', ['$http', function ($http) {
    var user = [];
    var userGetter = {
        
      	anyUsers: function(){
      	    return $http.get('/api/anyUsers');	
      	}, 
        isUser: function(){
            return $http.get('/api/isUser');
        },
        isAdmin: function(){
            return $http.get('/api/isAdmin');
        },
        getUser: function(){
            return $http.get('/api/getUser').then(function(response){
                return response.data;
            });
        },
        storeUser: function(obj){
            user[0] = obj;
        },
        returnUser: function(){
            return user[0];
        },
        removeClientUser: function(){
            user.splice(0, 1);
        }
    }
    return userGetter;
  }])

  .factory('geoJson', ['$http', 'userGetter', function($http, userGetter){
    var geoJson = {
        getWorldGroup: function(portfolio, group){
            return $http.get('/api/worldgroup/' +  portfolio + '/' + group)
            	.then(function(response){
                    return response.data;
	      })
        },
        getExpiriesForYear: function(portfolio, year){
            return $http.post('/api/expiriesForYear/' + portfolio, { year: year })

            }
        }
    return geoJson;
  }])

  .factory('trademarkReviser', ['$http', 'userGetter', '$rootScope', function($http, userGetter, $rootScope){
    
    function curry(fun){
        return function(arg){
            return fun(arg);
        }   
      }

      var trademarkReviser = {
          anyMarks: function(){
            return $http.get('/api/anyMarks');
          },
          getGroup: function(portfolio, group){
            return $http.get('/api/trademarks/' + portfolio + '/' + group)
                .then(function(response){
                    return response.data;
                });
          },
          getCountry: function(portfolio, iso){
              return $http.get('/api/country/' + portfolio + '/' + iso)
              	.then(function(response){
                    return response.data;
		       })
          },
          editGroup: function(portfolio, id, trademark){
              return $http.post('/api/editGroup/' + portfolio + '/' + id, { trademark: trademark })
          },
          editMarksInCountry: function(portfolio, id, trademark){
              trademark.country.coordinates = _.map(trademark.country.coordinates.split(","), curry(parseInt));
              return $http.post('/api/editMarksInCountry/' + portfolio + '/' + id, { trademark: trademark })
          },
          getExpiryDatesForGroup: function(portfolio, group){
              return $http.get('/api/expirydates/' + portfolio + '/' + group)
                 .then(function(response){
                     return response.data;
				})
          },
          getTrademark: function(id){
              return $http.get('/api/trademark/' + id)
              		.then(function(response){
                        return response.data;
                    })
          },
          deleteMark: function(trademark){
              return $http.delete('/api/trademark/' + trademark._id);
          },
          addMark: function(trademark){
                trademark.classes = _.map(trademark.classes.split(","), curry(parseInt));
                trademark.portfolio = userGetter.returnUser().activePortfolio;
                return $http.post('/api/trademark', { trademark: trademark })
          },
          editMark: function(trademark){
              if (typeof trademark.classes === 'string'){
                      trademark.classes = _.map(trademark.classes.split(","), curry(parseInt));
              }
              if (typeof trademark.country.coordinates === 'string'){
                      trademark.classes = _.map(trademark.country.coordinates.split(","), curry(parseInt));
              }
              trademark.updated = new Date().toISOString();
            
              return $http.put('/api/trademark/' + trademark._id, { trademark: trademark })
              }
          }
      return trademarkReviser;
  }])

  .factory('pathHolder', ['trademarkReviser', 'userGetter', function(trademarkReviser, userGetter){
      
      var path = [];
      var pathHolder = {
           insertPath: function(url){
                if (url != "/login"){ path[0] = url; };
           },
           returnPath: function(){
                return path[0];
           },
           existingPath: function(){
                if (path.length > 1){
                     return true;
                }
           }

      }
      return pathHolder;
  }])
  
  .factory('chartGetter', ['$filter', '$http', 'trademarkReviser', function($filter, $http, trademarkReviser){
        var chartGetter = {
            barChartDataForGroup: function(portfolio, group){
                return trademarkReviser.getExpiryDatesForGroup(portfolio, group)
                    .then(function(data){
                        var barData = $filter('extractExpiryDates')(data);
                        var fullBarData = {
                            labels : $filter('extractYears')(barData),
                            datasets : 
                                [{data : $filter('extractLength')(barData), 
                                fillColor : "rgb(57, 155, 104)"
                                }]
                            };
                        return fullBarData;
                        })
                
            },
            barChartOptions: function(){
                 return {
                        scaleShowGridLines : false,
                        scaleLineColor: "black",
                        scaleLineWidth : 2,
                        scaleOverlay : true,
                        scaleOverride : true,
                        scaleSteps : 4,
                        scaleStepWidth : 25,
                        scaleStartValue : 0,
                        barShowStroke : false,
                        barDatasetSpacing : 5,
                        scaleFontSize : 16,
                        animationSteps : 120
                    };
               },
               pieChartData: function(trademarks){
                    var d = $filter('groupByStatus')(trademarks);
                    var arr = [];
                    angular.forEach(d, function(set){
                        var obj = {};
                        obj.value = set.number;
                        arr.push(obj);
                    })
                    
                    if (arr[0]){
                        arr[0].color = "#F38630";
                    }
                    if (arr[1]){
                        arr[1].color = "#E0E4CC";
                    }
                    if (arr[2]){
                        arr[2].color = "#69D2E7";
                    }
                   
                    return arr;
               },
               pieChartSubtitles: function(trademarks){
                    return $filter('groupByStatus')(trademarks);
               },
               pieChartOptions: function(){
                    return {
                        segmentShowStroke : false,
                        animationSteps : 200
                    };
               }
        }
        return chartGetter;
  }])


},{}],5:[function(require,module,exports){
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

    


	
	
	



},{}],6:[function(require,module,exports){
angular.module('app')
    
    .controller('trademarkModalCtrl', ['$scope', '$timeout', '$rootScope', 'userGetter', 'trademarkReviser', '$http', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, $timeout, $rootScope, userGetter, trademarkReviser, $http, editTrademarkModal, trademarkModal) {
      var $ = $scope;
      
      $.alpha2 = $.trademark.country.alpha2.toLowerCase();
      
      $.closeModal = function() {
        trademarkModal.deactivate();
        $rootScope.modal = false;
      };
    
      $.openEditTrademarkModal = function(trademark){
        userGetter.isAdmin().then(function(){
                trademarkModal.deactivate();
                editTrademarkModal.activate({trademark: trademark})
            }, function(res){
                $.message = res.data.message;
            })
          }
    
      $.deleteTrademark = function(trademark){
        userGetter.isAdmin().then(function(res){
            trademarkReviser.deleteMark(trademark)
               .success(function(data){
                   $scope.message = data.message;
               })
            }, function(res){
                $.message = res.data.message;
                $timeout(function(){
                	trademarkModal.deactivate();
                	$rootScope.modal = false;
                }, 1000)
            })
        }
    }])
  
    
    .controller('editTrademarkModalCtrl', ['$scope', '$rootScope', '$http', 'trademarkReviser', 'editTrademarkModal',
      function ($scope, $rootScope, $http, trademarkReviser, editTrademarkModal) {
          var $ = $scope;
          $.closeModal = function() {
            editTrademarkModal.deactivate();
            $rootScope.modal = false;
          };
    
          $.statuses = ["Registered", "Published", "Pending"];
    
    
        $http.get('/api/countrydata')
            .success(function(data){
                $.countrydata = data;
            })
    
        $.editTrademark = function(trademark){
            trademarkReviser.editMark(trademark)
                .success(function(data){
                    $.message = data.message;
                });
            }
       
    }])

	.controller('editGroupCtrl', ['$scope', '$rootScope', '$http', 'trademarkReviser', 'editGroupModal',
         function($scope, $rootScope, $http, trademarkReviser, editGroupModal){
              var $ = $scope;
              $.closeModal = function() {
                    editGroupModal.deactivate();
                    $rootScope.modal = false;
              };
             
              $.editGroup = function(trademark){
                  trademarkReviser.editGroup($.id, trademark)
                      .success(function(data){
                          $.message = data.msg;
                          
			})
                  }
              
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', 'trademarkReviser', 'editCountryModal',
         function($scope, $rootScope, trademarkReviser, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkReviser.editMarksInCountry($.id, trademark)
                      .success(function(data){
                          $.message = data.msg;
				})
             }
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', 'trademarkReviser', 'editCountryModal',
         function($scope, $rootScope, trademarkReviser, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkReviser.editMarksInCountry($.id, trademark)
                      .success(function(data){
                          $.message = data.msg;
				})
             }
         }])

		.controller('uploadImageCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'uploadImageModal',
         function($scope, $routeParams, $rootScope, $http, uploadImageModal){
            var $ = $scope;
            $.closeModal = function() {
                uploadImageModal.deactivate();
                $rootScope.modal = false;
      		};
         	
    		$.uploadComplete = function(content) {
                 $.contents = content;
                 $.message = "Image uploaded";
                 $.url = content.url;
     		}
            
            $.saveLogo = function(mark, url){
              $http.post('/api/addLogoToGroup/' + $routeParams.portfolio + "/" + mark, { url: url})
                	.success(function(data){
                        $.message = data.msg;
                    })
            }
         }])
},{}],7:[function(require,module,exports){

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: '/partials/landing-page.html',
            controller: 'createAccountCtrl'
        }).
    when('/demo/:portfolio', {
            templateUrl: '/partials/admin.html',
            controller: 'adminCtrl',
            resolve: {
                user: function(userGetter){
                    return userGetter.getUser();
                },
                trademarks: function($route, trademarkReviser){
                    return trademarkReviser.getGroup($route.current.params.portfolio, "ALL MARKS");
                },
                world: function($route, geoJson){
                    return geoJson.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartData: function($route, chartGetter){
                    return chartGetter.barChartDataForGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartOptions: function(chartGetter){
                    return chartGetter.barChartOptions();
                }
            }
        }).
        when('/map/:portfolio', {
            templateUrl: '/partials/map.html',
            controller: 'mapCtrl',
            resolve: {
                user: function(userGetter){
                    return userGetter.isUser();
                },
                world: function($route, geoJson){
                    return geoJson.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                trademarks: function($route, trademarkReviser){
                    return trademarkReviser.getGroup($route.current.params.portfolio, "ALL MARKS");
                }
            }
        }).
        when('/login', {
            templateUrl: '/partials/login.html',
            controller: 'loginCtrl',
            resolve: {
                anyUsers: function(userGetter){
                    return userGetter.anyUsers();
                }
            }
        }).
          when('/reset-password', {
            templateUrl: '/partials/password-reset-request.html',
            controller: 'passwordResetCtrl'
        }).
        when('/password/:id', {
            templateUrl: '/partials/change-password.html',
            controller: 'passwordCtrl'
        }).
        when('/admin/user', {
            templateUrl: '/partials/add-user.html',
            controller: 'createUserCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        when('/upload', {
            templateUrl: '/partials/upload.html',
            controller: 'uploadCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }). 
        when('/admin/trademark', {
            templateUrl: '/partials/add.html',
            controller: 'addCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
   		when('/admin/trademark/:id', {
            templateUrl: '/partials/view-trademark.html',
            controller: 'trademarkViewCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        when('/admin/group/:portfolio/:group', {
            templateUrl: '/partials/view-group.html',
            controller: 'groupViewCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        when('/admin/country/:portfolio/:iso', {
            templateUrl: '/partials/view-country.html',
            controller: 'countryViewCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
    when('/admin/expiring/:portfolio/:year', {
            templateUrl: '/partials/expiry-map.html',
            controller: 'expiryCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        when('/admin/:portfolio', {
            templateUrl: '/partials/admin.html',
            controller: 'adminCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                },
                user: function(userGetter){
                    return userGetter.getUser();
                },
                trademarks: function($route, trademarkReviser){
                    return trademarkReviser.getGroup($route.current.params.portfolio, "ALL MARKS");
                },
                world: function($route, geoJson){
                    return geoJson.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartData: function($route, chartGetter){
                    return chartGetter.barChartDataForGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartOptions: function(chartGetter){
                    return chartGetter.barChartOptions();
                }
            }
        }).
        when('/create-account', {
            templateUrl: '/partials/create-account.html', 
            controller: 'createAccountCtrl'
            }
        ).
        when('/select-portfolio', {
            templateUrl:'/partials/select-portfolio.html',
            controller: 'selectPortfolioCtrl',
            resolve:{
                 admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        otherwise({
            redirectTo: '/'
    });
}]);

app.config(['$momentProvider', function($momentProvider){
    $momentProvider
      .asyncLoading(true)
      .scriptUrl('/vendor/moment.min.js');
  }]);


},{}]},{},[1,3,2,5,7,4,6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9nd3IvY2xpZW50L2FuZ3VsYXIvYXV0aGVudGljYXRpb24uanMiLCIvdmFyL3d3dy9nd3IvY2xpZW50L2FuZ3VsYXIvY29udHJvbGxlcnMuanMiLCIvdmFyL3d3dy9nd3IvY2xpZW50L2FuZ3VsYXIvZGlyZWN0aXZlcy5qcyIsIi92YXIvd3d3L2d3ci9jbGllbnQvYW5ndWxhci9mYWN0b3JpZXMuanMiLCIvdmFyL3d3dy9nd3IvY2xpZW50L2FuZ3VsYXIvZmlsdGVycy5qcyIsIi92YXIvd3d3L2d3ci9jbGllbnQvYW5ndWxhci9tb2RhbHMuanMiLCIvdmFyL3d3dy9nd3IvY2xpZW50L2FuZ3VsYXIvcm91dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXG4gICAgLmNvbnRyb2xsZXIoXCJhdXRoQ3RybFwiLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRodHRwJywgJ3RyYWRlbWFya1JldmlzZXInLCAncGF0aEhvbGRlcicsICckbG9jYXRpb24nLCAndHJhZGVtYXJrTW9kYWwnLCAnZWRpdFRyYWRlbWFya01vZGFsJywgJ2VkaXRHcm91cE1vZGFsJywgJ2VkaXRDb3VudHJ5TW9kYWwnLCAndXBsb2FkSW1hZ2VNb2RhbCcsICd1c2VyR2V0dGVyJyxcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgdHJhZGVtYXJrUmV2aXNlciwgcGF0aEhvbGRlciwgJGxvY2F0aW9uLCB0cmFkZW1hcmtNb2RhbCwgZWRpdFRyYWRlbWFya01vZGFsLCBlZGl0R3JvdXBNb2RhbCwgZWRpdENvdW50cnlNb2RhbCwgdXBsb2FkSW1hZ2VNb2RhbCwgdXNlckdldHRlcil7XG4gICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIGZ1bmN0aW9uKGV2ZW50LCBwcmV2aW91cyl7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsUGF0aCA9IHByZXZpb3VzLiQkcm91dGUub3JpZ2luYWxQYXRoO1xuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91cy5wYXJhbXMuaWQpe1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZShcIjppZFwiLCBwcmV2aW91cy5wYXJhbXMuaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXRoSG9sZGVyLmluc2VydFBhdGgob3JpZ2luYWxQYXRoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLmFueVVzZXJzKCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvY3JlYXRlLWFjY291bnQnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmxvYWRpbmdWaWV3ID0gZmFsc2U7XG4gICAgICAgICAgICAkLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmdWaWV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJC4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmdWaWV3ID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5yZW1vdmVNb2RhbE92ZXJsYXkgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgZWRpdFRyYWRlbWFya01vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICBlZGl0Q291bnRyeU1vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICBlZGl0R3JvdXBNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgdXBsb2FkSW1hZ2VNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQubG9nb3V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JylcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJHZXR0ZXIucmVtb3ZlQ2xpZW50VXNlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJC51c2VyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1c2VyR2V0dGVyLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUudXNlciA9IGRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICAgICAkLmlzVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhJHJvb3RTY29wZS51c2VyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1dKVxuICAgIFxuICAgIC5jb250cm9sbGVyKFwibG9naW5DdHJsXCIsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAndXNlckdldHRlcicsICdwYXRoSG9sZGVyJywgJyRodHRwJywgJyRsb2NhdGlvbicsICd0cmFkZW1hcmtSZXZpc2VyJyxcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCB1c2VyR2V0dGVyLCBwYXRoSG9sZGVyLCAkaHR0cCwgJGxvY2F0aW9uLCB0cmFkZW1hcmtSZXZpc2VyKXtcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmNhblN1Ym1pdExvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5sb2dpbkZvcm0uJGRpcnR5ICYmICQubG9naW5Gb3JtLiR2YWxpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5sb2dpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHsgcGFzc3dvcmQ6ICQucGFzc3dvcmQsIHVzZXJuYW1lOiAkLnVzZXJuYW1lIH0pXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLnN0b3JlVXNlcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS51c2VyID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoSG9sZGVyLmV4aXN0aW5nUGF0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKHBhdGhIb2xkZXIucmV0dXJuUGF0aCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2VsZWN0LXBvcnRmb2xpbycpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLm1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignYWRtaW5DdHJsJywgXG4gICAgICAgICAgICAgICBbJyRzY29wZScsIFxuICAgICAgICAgICAgICAgICckcm91dGVQYXJhbXMnLFxuICAgICAgICAgICAgICAgICckd2luZG93JyxcbiAgICAgICAgICAgICAgICAnJGZpbHRlcicsXG4gICAgICAgICAgICAgICAgJyRyb290U2NvcGUnLFxuICAgICAgICAgICAgICAgICckbG9jYXRpb24nLFxuICAgICAgICAgICAgICAgICd0cmFkZW1hcmtzJywgXG4gICAgICAgICAgICAgICAgJ3RyYWRlbWFya1JldmlzZXInLFxuICAgICAgICAgICAgICAgICdnZW9Kc29uJyxcbiAgICAgICAgICAgICAgICAnd29ybGQnLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICAgICAndXNlckdldHRlcicsXG4gICAgICAgICAgICAgICAgJ2NoYXJ0R2V0dGVyJywgXG4gICAgICAgICAgICAgICAgJ2JhckNoYXJ0RGF0YScsXG4gICAgICAgICAgICAgICAgJ2JhckNoYXJ0T3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJyRtb21lbnQnLFxuICAgICAgICAgICAgICAgICd0cmFkZW1hcmtNb2RhbCcsIFxuICAgICAgICAgICAgICAgICckaHR0cCcsIFxuICAgICAgIFxuICAgICAgICBmdW5jdGlvbigkc2NvcGUsIFxuICAgICAgICAgICAgICAgICAkcm91dGVQYXJhbXMsXG4gICAgICAgICAgICAgICAgICR3aW5kb3csXG4gICAgICAgICAgICAgICAgICRmaWx0ZXIsXG4gICAgICAgICAgICAgICAgICRyb290U2NvcGUsIFxuICAgICAgICAgICAgICAgICAkbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgIHRyYWRlbWFya3MsXG4gICAgICAgICAgICAgICAgIHRyYWRlbWFya1JldmlzZXIsXG4gICAgICAgICAgICAgICAgIGdlb0pzb24sXG4gICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICB1c2VyLFxuICAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLFxuICAgICAgICAgICAgICAgICBjaGFydEdldHRlciwgXG4gICAgICAgICAgICAgICAgIGJhckNoYXJ0RGF0YSxcbiAgICAgICAgICAgICAgICAgYmFyQ2hhcnRPcHRpb25zLFxuICAgICAgICAgICAgICAgICAkbW9tZW50LCBcbiAgICAgICAgICAgICAgICAgdHJhZGVtYXJrTW9kYWwsIFxuICAgICAgICAgICAgICAgICAkaHR0cCl7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmdldEpTT04gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignL2FwaS9kb3dubG9hZFRyYWRlbWFya3MvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvZmlsdGVyZWRDb3VudHJ5RGF0YS8nICsgJHJvdXRlUGFyYW1zLnBvcnRmb2xpbylcbiAgICAgICAgICAgIFx0LnN1Y2Nlc3MoZnVuY3Rpb24oY291bnRyaWVzKXtcbiAgICAgICAgICAgICAgICAgICAgJC5jb3VudHJpZXMgPSAkZmlsdGVyKCdvcmRlckJ5JykoY291bnRyaWVzLCAnbmFtZScpO1xuXHRcdCAgICAgICAgfSlcblxuICAgICAgICAgICAgJC4kb24oJ2NvdW50cnkuY2xpY2snLCBmdW5jdGlvbihlLCBsKXtcbiAgICAgICAgICAgICAgICAkLiRhcHBseShmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2FkbWluL2NvdW50cnkvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8gKyAnLycgKyBsLnRhcmdldC5mZWF0dXJlLmlkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zaG93R3JvdXAgPSBmdW5jdGlvbih0bSl7XG4gICAgICAgICAgICAgICAgdHJhZGVtYXJrUmV2aXNlci5nZXRHcm91cCgkcm91dGVQYXJhbXMucG9ydGZvbGlvLCB0bS5uYW1lKS50aGVuKGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuICAgICAgICAgICAgICAgICAgICAkLnRyYWRlbWFya3MgPSB0cmFkZW1hcmtzO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgZ2VvSnNvbi5nZXRXb3JsZEdyb3VwKCRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8sIHRtLm5hbWUpLnRoZW4oZnVuY3Rpb24oZ2VvanNvbil7XG4gICAgICAgICAgICAgICAgICAgICQuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBjaGFydEdldHRlci5iYXJDaGFydERhdGFGb3JHcm91cCgkcm91dGVQYXJhbXMucG9ydGZvbGlvLCB0bS5uYW1lKS50aGVuKGZ1bmN0aW9uKGJhckNoYXJ0RGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICQuY2hhcnQgPSBiYXJDaGFydERhdGE7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAkLm1hcmtzID0gJGZpbHRlcigndW5UaWNrQWxsRXhjZXB0U2VsZWN0ZWQnKSgkLm1hcmtzLCB0bSk7XG4gICAgICAgICAgICAgICAgJC5hY3RpdmVNYXJrID0gdG0ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zaG93TW9kYWwgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRyYWRlbWFya01vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5hY3RpdmF0ZSh7IHRyYWRlbWFyazogdHJhZGVtYXJrIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5leHBpcnlGb3JtVmFsaWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICByZXR1cm4gJC5leHBpcnlGb3JtLiRkaXJ0eSAmJiAkLmV4cGlyeUZvcm0uJHZhbGlkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICAgICAkLmFjdGl2ZVBvcnRmb2xpbyA9ICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW87XG4gICAgICAgICAgICAkLmdlb2pzb24gPSB3b3JsZDtcbiAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IHRyYWRlbWFya3M7XG4gICAgICAgICAgICAkLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgJC5tYXJrcyA9ICRmaWx0ZXIoJ2dyb3VwQnlNYXJrcycpKHRyYWRlbWFya3MpO1xuICAgICAgICAgICAgJC5tYXJrcy51bnNoaWZ0KHsgbmFtZTogXCJBTEwgTUFSS1NcIiB9KVxuICAgICAgICAgICAgJC5jaGFydCA9IGJhckNoYXJ0RGF0YTtcbiAgICAgICAgICAgICQub3B0aW9ucyA9IGJhckNoYXJ0T3B0aW9ucztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zZW5kTWFya3NUb1NlcnZlciA9IGZ1bmN0aW9uKG1hcmtzKXtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3dvcmxkLycgKyAkcm91dGVQYXJhbXMucG9ydGZvbGlvLCB7IG1hcmtzOiAkZmlsdGVyKCdleHRyYWN0Q2hlY2tlZE1hcmtzJykobWFya3MpIH0pXG4gICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbih3b3JsZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJC5nZW9qc29uID0gd29ybGQ7XG4gICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5nb1RvR3JvdXAgPSBmdW5jdGlvbihvYmope1xuICAgICAgICAgICAgXHQkbG9jYXRpb24ucGF0aCgnL2FkbWluL2dyb3VwLycgKyAkcm91dGVQYXJhbXMucG9ydGZvbGlvICsgJy8nICsgb2JqLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmdvVG9Db3VudHJ5ID0gZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2FkbWluL2NvdW50cnkvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8gKyAnLycgKyBvYmouYWxwaGEzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC4kd2F0Y2goJ3RyYWRlbWFya3MnLCBmdW5jdGlvbih0cmFkZW1hcmtzKXtcbiAgICAgICAgICAgICAgICBpZiAoIXRyYWRlbWFya3MpeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmluY29tcGxldGVNYXJrcyA9ICRmaWx0ZXIoJ2luY29tcGxldGVNYXJrcycpKHRyYWRlbWFya3MpO1xuICAgICAgICAgICAgICAgICQuc29ydGVkQnlFeHBpcnkgPSAkZmlsdGVyKCdmcm9tTm93JykoJGZpbHRlcignc29ydEJ5RXhwaXJ5RGF0ZScpKCRmaWx0ZXIoJ2V4dHJhY3RSZWdpc3RlcmVkTWFya3MnKSh0cmFkZW1hcmtzKSkpO1xuICAgICAgICAgICAgICAgICQucGllRGF0YSA9IGNoYXJ0R2V0dGVyLnBpZUNoYXJ0RGF0YSh0cmFkZW1hcmtzKTtcbiAgICAgICAgICAgICAgICAkLnBpZU9wdGlvbnMgPSBjaGFydEdldHRlci5waWVDaGFydE9wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAkLmNoYXJ0U3VidGl0bGVzID0gY2hhcnRHZXR0ZXIucGllQ2hhcnRTdWJ0aXRsZXModHJhZGVtYXJrcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICQuZXhwaXJ5U2VhcmNoID0gZnVuY3Rpb24oeWVhcil7XG4gICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvYWRtaW4vZXhwaXJpbmcvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8gKyAnLycgKyB5ZWFyKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJC5taW4gPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIH1dKVxuXG4gICAgLmNvbnRyb2xsZXIoJ3VwbG9hZEN0cmwnLCBbJyRzY29wZScsICckbG9jYXRpb24nLCAndXNlckdldHRlcicsICckdGltZW91dCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyR2V0dGVyLCAkdGltZW91dCl7XG4gICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAkLnVwbG9hZENvbXBsZXRlID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGlmIChjb250ZW50LmVycil7XG4gICAgICAgICAgICAgICAgJC5yZXNwb25zZSA9IGNvbnRlbnQuZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgJC5yZXNwb25zZSA9IGNvbnRlbnQubXNnOyBcbiAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NlbGVjdC1wb3J0Zm9saW8nKVxuICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgIFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZGluZy4uLicpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAgICQudXBsb2FkRm9ybVZhbGlkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICByZXR1cm4gJC51cGxvYWRGb3JtLiRkaXJ0eSAmJiAkLnVwbG9hZEZvcm0uJHZhbGlkO1xuICAgICAgICB9O1xuICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCd0cmFkZW1hcmtWaWV3Q3RybCcsIFxuXHRbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICd0cmFkZW1hcmtSZXZpc2VyJywgJ2VkaXRUcmFkZW1hcmtNb2RhbCcsICd0cmFkZW1hcmtNb2RhbCcsIFxuXHRmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgdHJhZGVtYXJrUmV2aXNlciwgZWRpdFRyYWRlbWFya01vZGFsLCB0cmFkZW1hcmtNb2RhbCl7XG5cdCAgICAgICAgdmFyICQgPSAkc2NvcGU7XG5cdCAgICAgICAgdHJhZGVtYXJrUmV2aXNlci5nZXRUcmFkZW1hcmsoJHJvdXRlUGFyYW1zLmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHQgICAgICAgICAgICAkLnRyYWRlbWFyayA9IGRhdGE7XG5cdCAgICAgICAgICAgICQuYWxwaGEyID0gZGF0YS5jb3VudHJ5LmFscGhhMi50b0xvd2VyQ2FzZSgpO1xuXHQgICAgICAgIH0pO1xuXHQgICAgICAgIFxuXHQgICAgICAgICQub3BlbkVkaXRUcmFkZW1hcmtNb2RhbCA9IGZ1bmN0aW9uKCl7XG5cdCAgICAgICAgICAgICAgICBlZGl0VHJhZGVtYXJrTW9kYWwuYWN0aXZhdGUoe3RyYWRlbWFyazogJC50cmFkZW1hcmt9KTtcblx0ICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSB0cnVlO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICBcblx0ICAgICAgICAkLmRlbGV0ZVRyYWRlbWFyayA9IGZ1bmN0aW9uKCl7XG5cdCAgICAgICAgICAgIHRyYWRlbWFya1JldmlzZXIuZGVsZXRlTWFyaygkLnRyYWRlbWFyaylcblx0ICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG5cdCAgICAgICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcblx0ICAgICAgICAgICAgICAgfSlcblx0ICAgICAgICAgICB9XG4gICAgICAgICB9XSlcbiAgICAgICAgIFxuICAgICAgICAuY29udHJvbGxlcignZ3JvdXBWaWV3Q3RybCcsIFxuXHRcdFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRmaWx0ZXInLCAnJGh0dHAnLCAnJHJvdXRlUGFyYW1zJywgJ2dlb0pzb24nLCAndHJhZGVtYXJrUmV2aXNlcicsICdlZGl0VHJhZGVtYXJrTW9kYWwnLCAndHJhZGVtYXJrTW9kYWwnLCAnZWRpdEdyb3VwTW9kYWwnLCAndXBsb2FkSW1hZ2VNb2RhbCcsXG5cdFx0ZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRmaWx0ZXIsICRodHRwLCAkcm91dGVQYXJhbXMsIGdlb0pzb24sIHRyYWRlbWFya1JldmlzZXIsIGVkaXRUcmFkZW1hcmtNb2RhbCwgdHJhZGVtYXJrTW9kYWwsIGVkaXRHcm91cE1vZGFsLCB1cGxvYWRJbWFnZU1vZGFsKXtcblx0ICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgIFxuXHQgICAgICAgIGdlb0pzb24uZ2V0V29ybGRHcm91cCgkcm91dGVQYXJhbXMucG9ydGZvbGlvLCAkcm91dGVQYXJhbXMuZ3JvdXApLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdCAgICAgICAgICAgICQuZ2VvanNvbiA9IGRhdGE7XG5cdCAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAgICAgdHJhZGVtYXJrUmV2aXNlci5nZXRHcm91cCgkcm91dGVQYXJhbXMucG9ydGZvbGlvLCAkcm91dGVQYXJhbXMuZ3JvdXApLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgJC50cmFkZW1hcmtzID0gZGF0YTtcbiAgICAgICAgICAgICAgICAkLmNoYXJ0U3VidGl0bGVzID0gJGZpbHRlcignZ3JvdXBCeVN0YXR1cycpKCQudHJhZGVtYXJrcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvbGlzdE9mTWFya3MvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8pXG4gICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgJC5tYXJrcyA9IGRhdGE7XG4gICAgICAgICAgICAgIH0pXG5cdCAgICAgICAgXG5cdCAgICAgICAgJC5zaG93TW9kYWwgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuXHQgICAgICAgICAgICAkcm9vdFNjb3BlLm1vZGFsID0gdHJ1ZTtcblx0ICAgICAgICAgICAgdHJhZGVtYXJrTW9kYWwuZGVhY3RpdmF0ZSgpO1xuXHQgICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5hY3RpdmF0ZSh7IHRyYWRlbWFyazogdHJhZGVtYXJrIH0pO1xuXHQgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zaG93RWRpdEdyb3VwTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBpZCA9ICQudHJhZGVtYXJrc1swXS5tYXJrO1xuICAgICAgICAgICAgICAgIGVkaXRHcm91cE1vZGFsLmFjdGl2YXRlKHsgdHJhZGVtYXJrOiAkLnRyYWRlbWFya3NbMF0sIGlkOiBpZCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5nb1RvR3JvdXAgPSBmdW5jdGlvbihvYmope1xuICAgICAgICAgICAgXHQkbG9jYXRpb24ucGF0aCgnL2FkbWluL2dyb3VwLycgKyBvYmoubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQuc2hvd1VwbG9hZEltYWdlTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBpZCA9ICQudHJhZGVtYXJrc1swXS5tYXJrO1xuICAgICAgICAgICAgICAgIHVwbG9hZEltYWdlTW9kYWwuYWN0aXZhdGUoeyBpZDogaWQgfSk7XG4gICAgICAgICAgICB9O1xuXG5cdCAgICAgICAgJC4kb24oJ2NvdW50cnkuY2xpY2snLCBmdW5jdGlvbihlLCBsKXtcblx0ICAgICAgICAgICAgJC5yZWdpc3RlcmVkID0gZmFsc2U7XG5cdCAgICAgICAgICAgICQucGVuZGluZyA9IGZhbHNlO1xuXHQgICAgICAgICAgICAkLnB1Ymxpc2hlZCA9IGZhbHNlO1xuXHQgICAgICAgICAgICAkLm5vY29udGVudCA9IHRydWU7XG5cdCAgICAgICAgICAgICQuJGFwcGx5KGZ1bmN0aW9uKCl7XG5cdCAgICAgICAgICAgICAgICAkLmNvdW50cnkgPSBsLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMubmFtZTtcblx0ICAgICAgICAgICAgICAgICQuYWxwaGEyID0gbC50YXJnZXQuZmVhdHVyZS5hbHBoYTIudG9Mb3dlckNhc2UoKTtcblx0ICAgICAgICAgICAgICAgICQuYWxwaGEzID0gbC50YXJnZXQuZmVhdHVyZS5pZDtcblx0ICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICB2YXIgdG1zID0gbC50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLnRyYWRlbWFya3M7XG5cdCAgICAgICAgICAgICAgICBpZiAodG1zKXtcblx0ICAgICAgICAgICAgICAgICAgICAkLm5vY29udGVudCA9IGZhbHNlO1xuXHQgICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUmVnaXN0ZXJlZClcblx0ICAgICAgICAgICAgICAgICAgICAgICAgJC5yZWdpc3RlcmVkID0gdG1zLlJlZ2lzdGVyZWQ7XG5cdFxuXHQgICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUHVibGlzaGVkKVxuXHQgICAgICAgICAgICAgICAgICAgICAgICAkLnB1Ymxpc2hlZCA9IHRtcy5QdWJsaXNoZWQ7XG5cdFxuXHQgICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUGVuZGluZylcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICQucGVuZGluZyA9IHRtcy5QZW5kaW5nO1xuXHQgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgXG5cdCAgICAgICAgICAgICB9KTtcblx0ICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCdjb3VudHJ5Vmlld0N0cmwnLCBcblx0XHRbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckZmlsdGVyJywgJyRodHRwJywgJyRyb3V0ZVBhcmFtcycsICdnZW9Kc29uJywgJ3RyYWRlbWFya1JldmlzZXInLCAnZWRpdFRyYWRlbWFya01vZGFsJywgJ3RyYWRlbWFya01vZGFsJywgJ2VkaXRDb3VudHJ5TW9kYWwnLCBcblx0XHRmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRsb2NhdGlvbiwgJGZpbHRlciwgJGh0dHAsICRyb3V0ZVBhcmFtcywgZ2VvSnNvbiwgdHJhZGVtYXJrUmV2aXNlciwgZWRpdFRyYWRlbWFya01vZGFsLCB0cmFkZW1hcmtNb2RhbCwgZWRpdENvdW50cnlNb2RhbCl7XG5cdCAgICAgICAgdmFyICQgPSAkc2NvcGU7XG4gICAgICAgIFxuICAgICAgICAgICAgdHJhZGVtYXJrUmV2aXNlci5nZXRDb3VudHJ5KCRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8sICRyb3V0ZVBhcmFtcy5pc28pLnRoZW4oZnVuY3Rpb24odHJhZGVtYXJrcyl7XG4gICAgICAgICAgICAgICAgJC50cmFkZW1hcmtzID0gdHJhZGVtYXJrcztcbiAgICAgICAgICAgICAgICAkLnRyYWRlbWFyayA9IHRyYWRlbWFya3NbMF07XG4gICAgICAgICAgICAgICAgJC5jb3VudHJpZXMgPSAkZmlsdGVyKCdleHRyYWN0Q291bnRyaWVzJykoJC50cmFkZW1hcmtzKTtcbiAgICAgICAgICAgICAgICBpZiAoXy5ldmVyeSgkLmNvdW50cmllcywgZnVuY3Rpb24oYyl7IHJldHVybiBjID09PSBcIkV1cm9wZWFuIFVuaW9uXCJ9KSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJC5jb3VudHJ5ID0gXCJFdXJvcGVhbiBVbmlvblwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJC5jb3VudHJ5ID0gXy53aXRob3V0KCQuY291bnRyaWVzLCBcIkV1cm9wZWFuIFVuaW9uXCIpWzBdO1xuXHRcdFx0XHR9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL2xpc3RPZk1hcmtzLycgKyAkcm91dGVQYXJhbXMucG9ydGZvbGlvICsgJy8nICsgJHJvdXRlUGFyYW1zLmlzbylcbiAgICAgICAgIFx0ICAgLnN1Y2Nlc3MoZnVuY3Rpb24obGlzdCl7XG4gICAgICAgICAgXHQgICAgICAkLm1hcmtzID0gbGlzdDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICBcbiAgICAgICAgICAgICQuJHdhdGNoKCd0cmFkZW1hcmtzJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkLm5vY29udGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgJC5yZWdpc3RlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJC5wdWJsaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmNvdW50cnlUTSA9IGRhdGFbMF07XG4gICAgICAgICAgICAgICAgJC5zb3J0ZWRCeVN0YXR1cyA9IF8uZ3JvdXBCeShkYXRhLCAnc3RhdHVzJyk7XG4gICAgICAgICAgICAgICAgJC5jaGFydFN1YnRpdGxlcyA9ICRmaWx0ZXIoJ2dyb3VwQnlTdGF0dXMnKShkYXRhKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLm5vY29udGVudCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCQuc29ydGVkQnlTdGF0dXMuUmVnaXN0ZXJlZClcbiAgICAgICAgICAgICAgICAgICAgICQucmVnaXN0ZXJlZCA9ICQuc29ydGVkQnlTdGF0dXMuUmVnaXN0ZXJlZDtcbiAgICAgICAgICAgICAgICBpZiAoJC5zb3J0ZWRCeVN0YXR1cy5QdWJsaXNoZWQpXG4gICAgICAgICAgICAgICAgICAgICAkLnB1Ymxpc2hlZCA9ICQuc29ydGVkQnlTdGF0dXMuUHVibGlzaGVkO1xuICAgICAgICAgICAgICAgIGlmICgkLnNvcnRlZEJ5U3RhdHVzLlBlbmRpbmcpXG4gICAgICAgICAgICAgICAgICAgICAkLnBlbmRpbmcgPSAkLnNvcnRlZEJ5U3RhdHVzLlBlbmRpbmc7XG4gICAgICAgICAgICB9KVxuXHQgICAgICAgIFxuXHQgICAgICAgICQuc2hvd01vZGFsID0gZnVuY3Rpb24odHJhZGVtYXJrKXtcbiAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAkcm9vdFNjb3BlLm1vZGFsID0gdHJ1ZTtcblx0ICAgICAgICAgICAgdHJhZGVtYXJrTW9kYWwuZGVhY3RpdmF0ZSgpO1xuXHQgICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5hY3RpdmF0ZSh7IHRyYWRlbWFyazogdHJhZGVtYXJrIH0pO1xuXHQgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zZW5kTWFya3NUb1NlcnZlciA9IGZ1bmN0aW9uKG1hcmtzKXtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2NvdW50cnkvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8gKyBcIi9cIiArICRyb3V0ZVBhcmFtcy5pc28sIHsgbWFya3M6ICRmaWx0ZXIoJ2V4dHJhY3RDaGVja2VkTWFya3MnKShtYXJrcykgfSlcbiAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IHRyYWRlbWFya3M7XG4gICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLnNob3dFZGl0Q291bnRyeU1vZGFsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLm1vZGFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlZGl0Q291bnRyeU1vZGFsLmFjdGl2YXRlKHsgdHJhZGVtYXJrOiAkLmNvdW50cnlUTSwgaWQ6ICRyb3V0ZVBhcmFtcy5pZCB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgXG4gICAgICAgICB9XSlcblxuXHQuY29udHJvbGxlcignZXhwaXJ5Q3RybCcsIFxuICAgICAgICBbJyRzY29wZScsICckcm9vdFNjb3BlJywgICckcm91dGVQYXJhbXMnLCAnJGxvY2F0aW9uJywgJ2dlb0pzb24nLCAnZWRpdFRyYWRlbWFya01vZGFsJywgJ3RyYWRlbWFya01vZGFsJywgXG4gICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uLCBnZW9Kc29uLCBlZGl0VHJhZGVtYXJrTW9kYWwsIHRyYWRlbWFya01vZGFsKXtcbiAgICAgICAgdmFyICQgPSAkc2NvcGU7XG4gICAgICAgIGdlb0pzb24uZ2V0RXhwaXJpZXNGb3JZZWFyKCRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8sICRyb3V0ZVBhcmFtcy55ZWFyKS5zdWNjZXNzKGZ1bmN0aW9uKGdlb2pzb24pe1xuICAgICAgICAgICAgICAkLmdlb2pzb24gPSBnZW9qc29uO1xuICAgICAgICB9KTtcbiAgICAgICAgICAgICBcbiAgICAgICAgJC4kb24oJ2NvdW50cnkuY2xpY2snLCBmdW5jdGlvbihlLCBsKXtcbiAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5ub2NvbnRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgJC4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkLmNvdW50cnkgPSBsLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMubmFtZTtcbiAgICAgICAgICAgICAgICAkLmNvdW50cnljb2RlID0gbC50YXJnZXQuZmVhdHVyZS5hbHBoYTIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0bXMgPSBsLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMudHJhZGVtYXJrcztcbiAgICAgICAgICAgICAgICBpZiAodG1zKXtcbiAgICAgICAgICAgICAgICAgICAgJC5ub2NvbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRtcy5SZWdpc3RlcmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgJC50cmFkZW1hcmtzID0gdG1zLlJlZ2lzdGVyZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgICAgICBcbiAgICAgICAgJC5zaG93TW9kYWwgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICAgICAgJHJvb3RTY29wZS5tb2RhbCA9IHRydWU7XG4gICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICB0cmFkZW1hcmtNb2RhbC5hY3RpdmF0ZSh7IHRyYWRlbWFyazogdHJhZGVtYXJrIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkLmV4cGlyeUZvcm1WYWxpZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gJC5leHBpcnlGb3JtLiRkaXJ0eSAmJiAkLmV4cGlyeUZvcm0uJHZhbGlkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJC5jaGFuZ2VZZWFyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvYWRtaW4vZXhwaXJpbmcvJyArICRyb3V0ZVBhcmFtcy5wb3J0Zm9saW8gKyAnLycgKyAkLnllYXIpXG4gICAgICAgIH07XG4gICAgICAgICAgICAgXG4gICAgICAgICQubWluID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpO1xuXG4gICAgfV0pXG5cbiAgICAgLmNvbnRyb2xsZXIoJ3Bhc3N3b3JkQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICckaHR0cCcsICckdGltZW91dCcsICckbG9jYXRpb24nLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJGh0dHAsICR0aW1lb3V0LCAkbG9jYXRpb24pe1xuICAgICAgICB2YXIgJCA9ICRzY29wZTtcblxuICAgICAgICAkLmNoYW5nZVBhc3N3b3JkRm9ybVZhbGlkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAkLmNoYW5nZVBhc3N3b3JkRm9ybS4kZGlydHkgJiYgJC5jaGFuZ2VQYXNzd29yZEZvcm0uJHZhbGlkO1xuICAgICAgICB9O1xuXG4gICAgICAgICQuY2hhbmdlUGFzc3dvcmQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKCQubmV3UGFzc3dvcmQgIT0gJC5kdXBsaWNhdGVQYXNzd29yZCl7XG4gICAgICAgICAgICAgICAgJC5tZXNzYWdlID0gXCJUaGUgdHdvIHBhc3N3b3JkcyBkb24ndCBtYXRjaCFcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvcGFzc3dvcmRSZXNldC8nICsgJHJvdXRlUGFyYW1zLmlkLCB7IG5ld1Bhc3N3b3JkOiAkLm5ld1Bhc3N3b3JkLCBkdXBsaWNhdGVQYXNzd29yZDogJC5kdXBsaWNhdGVQYXNzd29yZH0pXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJC5tZXNzYWdlID0gXCJQYXNzd29yZCB1cGRhdGVkXCI7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7IFxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICB9XSlcblxuICAgICAuY29udHJvbGxlcigncGFzc3dvcmRSZXNldEN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApe1xuICAgICAgICB2YXIgJCA9ICRzY29wZTtcblxuICAgICAgICAkLnBhc3N3b3JkUmVzZXRGb3JtVmFsaWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICByZXR1cm4gJC5wYXNzd29yZFJlc2V0Rm9ybS4kZGlydHkgJiYgJC5wYXNzd29yZFJlc2V0Rm9ybS4kdmFsaWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgJC5yZXF1ZXN0UGFzc3dvcmRSZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3JlcXVlc3RQYXNzd29yZFJlc2V0JywgeyBlbWFpbDogJC5lbWFpbCB9KVxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IFwiSWYgdGhlIGFib3ZlIGVtYWlsIGFkZHJlc3MgaXMgaW4gb3VyIGRhdGFiYXNlLCB5b3UgaGF2ZSBiZWVuIHNlbnQgYW4gZW1haWwgYWxsb3dpbmcgeW91IHRvIGNoYW5nZSB5b3VyIHBhc3N3b3JkXCI7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICB9XSlcblxuXG4gICAgLmNvbnRyb2xsZXIoJ2FkZEN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsICd0cmFkZW1hcmtSZXZpc2VyJyxcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgdHJhZGVtYXJrUmV2aXNlcil7XG4gICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9jb3VudHJ5ZGF0YScpXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICQuY291bnRyeWRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICQuYWRkVHJhZGVtYXJrID0gZnVuY3Rpb24odHJhZGVtYXJrKXtcbiAgICAgICAgICAgICAgICB0cmFkZW1hcmtSZXZpc2VyLmFkZE1hcmsodHJhZGVtYXJrKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAkLmNhbkFkZFRyYWRlbWFyayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgIHJldHVybiAkLmFkZFRyYWRlbWFya0Zvcm0uJGRpcnR5ICYmICQuYWRkVHJhZGVtYXJrRm9ybS4kdmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKVxuXG4gICAgLmNvbnRyb2xsZXIoJ2NyZWF0ZVVzZXJDdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnJGxvY2F0aW9uJyxcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uKXtcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgJC5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2FkZFVzZXInLCAkLnVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5jYW5TdWJtaXRDcmVhdGVVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5jcmVhdGVVc2VyRm9ybS4kZGlydHkgJiYgJC5jcmVhdGVVc2VyRm9ybS4kdmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCdjcmVhdGVBY2NvdW50Q3RybCcsIFsnJHNjb3BlJywgJyRodHRwJywgJyRsb2NhdGlvbicsICd1c2VyR2V0dGVyJyxcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCB1c2VyR2V0dGVyKXtcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgJC5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2NyZWF0ZUFjY291bnQnLCAkLnVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5jYW5TdWJtaXRDcmVhdGVVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5jcmVhdGVVc2VyRm9ybS4kZGlydHkgJiYgJC5jcmVhdGVVc2VyRm9ybS4kdmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQubG9hZERlbW8gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7IHBhc3N3b3JkOiBcImRlbW9cIiwgdXNlcm5hbWU6IFwiZGVtb0BkZW1vLmNvbVwiIH0pXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyR2V0dGVyLnN0b3JlVXNlcihyZXNwb25zZSk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvZGVtby9BQ01FIElOQycpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLm1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XSlcblxuICAgIC5jb250cm9sbGVyKCdzZWxlY3RQb3J0Zm9saW9DdHJsJywgWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ3VzZXJHZXR0ZXInLCAnJHJvb3RTY29wZScsXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyR2V0dGVyLCAkcm9vdFNjb3BlKXtcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgJC5wb3J0Zm9saW9zID0gdXNlckdldHRlci5yZXR1cm5Vc2VyKCkucG9ydGZvbGlvcztcblxuICAgICAgICAgICAgJC5nb1RvUG9ydGZvbGlvID0gZnVuY3Rpb24ocG9ydGZvbGlvKXtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2FkbWluLycgKyBwb3J0Zm9saW8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XSlcblxuICAgIC5jb250cm9sbGVyKFwibWFwQ3RybFwiLCBbJyRzY29wZScsICckZmlsdGVyJywgJyRyb290U2NvcGUnLCAnd29ybGQnLCAndHJhZGVtYXJrcycsICckaHR0cCcsICdlZGl0VHJhZGVtYXJrTW9kYWwnLCAndHJhZGVtYXJrTW9kYWwnLFxuICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRmaWx0ZXIsICRyb290U2NvcGUsIHdvcmxkLCB0cmFkZW1hcmtzLCAkaHR0cCwgZWRpdFRyYWRlbWFya01vZGFsLCB0cmFkZW1hcmtNb2RhbCkge1xuICAgICAgICB2YXIgJCA9ICRzY29wZTtcblxuICAgICAgICAkLmdlb2pzb24gPSB3b3JsZDtcbiAgICAgICAgJC5tYXJrcyA9ICRmaWx0ZXIoJ2dyb3VwQnlNYXJrcycpKHRyYWRlbWFya3MpO1xuICAgICAgICAkLm1hcmtzLnVuc2hpZnQoeyBuYW1lOiBcIkFMTCBNQVJLU1wiIH0pO1xuICAgICAgICAkLnNlbmRNYXJrc1RvU2VydmVyID0gZnVuY3Rpb24obWFya3Mpe1xuICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS93b3JsZCcsIHsgbWFya3M6ICRmaWx0ZXIoJ2V4dHJhY3RDaGVja2VkTWFya3MnKShtYXJrcykgfSlcbiAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24od29ybGQpe1xuICAgICAgICAgICAgICAgICAgICAgJC5nZW9qc29uID0gd29ybGQ7XG4gICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgJC5jYW5GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuICQuZmlsdGVyVE1zRm9ybS4kZGlydHkgJiYgJC5maWx0ZXJUTXNGb3JtLiR2YWxpZDtcbiAgICAgICAgfVxuXG4gICAgICAgICQuJG9uKCdjb3VudHJ5LmNsaWNrJywgZnVuY3Rpb24oZSwgbCl7XG4gICAgICAgICAgICAkLnRyYWRlbWFya3MgPSBmYWxzZTtcbiAgICAgICAgICAgICQucGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5wdWJsaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICQubm9jb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICQuJGFwcGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJC5jb3VudHJ5ID0gbC50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLm5hbWU7XG4gICAgICAgICAgICAgICAgJC5jb3VudHJ5Y29kZSA9IGwudGFyZ2V0LmZlYXR1cmUuYWxwaGEyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdG1zID0gbC50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLnRyYWRlbWFya3M7XG4gICAgICAgICAgICAgICAgaWYgKHRtcyl7XG4gICAgICAgICAgICAgICAgICAgICQubm9jb250ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUmVnaXN0ZXJlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IHRtcy5SZWdpc3RlcmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUHVibGlzaGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgJC5wdWJsaXNoZWQgPSB0bXMuUHVibGlzaGVkO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0bXMuUGVuZGluZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAkLnBlbmRpbmcgPSB0bXMuUGVuZGluZztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZmlsdGVyUG9ydGZvbGlvID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkLnB1Ymxpc2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgJC5ub2NvbnRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgXy5lYWNoKCQuZ2VvanNvbiwgZnVuY3Rpb24oZmVhdHVyZSl7XG4gICAgICAgICAgICAgICAgaWYgKCQuc2VhcmNoY291bnRyeS50b0xvd2VyQ2FzZSgpID09PSBmZWF0dXJlLnByb3BlcnRpZXMubmFtZS50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtcyA9IGZlYXR1cmUucHJvcGVydGllcy50cmFkZW1hcmtzO1xuICAgICAgICAgICAgICAgICAgICAkLmNvdW50cnkgPSBmZWF0dXJlLnByb3BlcnRpZXMubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgJC5jb3VudHJ5Y29kZSA9IGZlYXR1cmUuYWxwaGEyLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRtcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLm5vY29udGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRtcy5SZWdpc3RlcmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQudHJhZGVtYXJrcyA9IHRtcy5SZWdpc3RlcmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRtcy5QdWJsaXNoZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5wdWJsaXNoZWQgPSB0bXMuUHVibGlzaGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRtcy5QZW5kaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQucGVuZGluZyA9IHRtcy5QZW5kaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICQuc2hvd01vZGFsID0gZnVuY3Rpb24odHJhZGVtYXJrKXtcbiAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSB0cnVlO1xuICAgICAgICAgICAgdHJhZGVtYXJrTW9kYWwuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgdHJhZGVtYXJrTW9kYWwuYWN0aXZhdGUoeyB0cmFkZW1hcms6IHRyYWRlbWFyayB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgfV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG5cbiAgICAuZGlyZWN0aXZlKCdtZ01hcCcsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBtYXAgPSBMLm1hcGJveC5tYXAoYXR0cnMuaWQsICdncmFiYmVoLmdjaDBvbWxiJyx7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBbMzMsIDMxXSxcbiAgICAgICAgICAgICAgICB6b29tOiAyLFxuICAgICAgICAgICAgICAgIG1pblpvb206IDFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVHZW9Kc29uKHdvcmxkKXtcbiAgICAgICAgICAgICAgICBpZiAoJHJvb3RTY29wZS5sKXsgbWFwLnJlbW92ZUxheWVyKCRyb290U2NvcGUubCk7IH1cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmwgPSBMLmdlb0pzb24od29ybGQsIFxuICAgICAgICAgICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgIHN0eWxlOiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZmVhdHVyZS5wcm9wZXJ0aWVzLnN0YXR1cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIGZhbHNlIDogcmV0dXJuIHsgIFwiY29sb3JcIjogXCJ3aGl0ZVwiLCBcIndlaWdodFwiOiAxLCBcIm9wYWNpdHlcIjowfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvbmx5IHBlbmRpbmdcIiA6IHJldHVybiB7ICBcImNvbG9yXCI6IFwicmVkXCIsIFwid2VpZ2h0XCI6IDEsIFwib3BhY2l0eVwiOjF9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9ubHkgcHVibGlzaGVkXCIgOiByZXR1cm4geyAgXCJjb2xvclwiOiBcInJlZFwiLCBcIndlaWdodFwiOiAxLCBcIm9wYWNpdHlcIjoxfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwZW5kaW5nIHB1Ymxpc2hlZFwiIDogcmV0dXJuIHsgIFwiY29sb3JcIjogXCJyZWRcIiwgXCJ3ZWlnaHRcIjogMSwgXCJvcGFjaXR5XCI6MX07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwib25seSByZWdpc3RlcmVkXCIgOiByZXR1cm4geyAgXCJjb2xvclwiOiBcImdyZWVuXCIsIFwid2VpZ2h0XCI6IDEsIFwib3BhY2l0eVwiOiAxMDB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlZ2lzdGVyZWQgcGVuZGluZyBwdWJsaXNoZWRcIiA6IHJldHVybiB7ICBcImNvbG9yXCI6IFwiZ3JlZW5cIiwgXCJ3ZWlnaHRcIjogMSwgXCJvcGFjaXR5XCI6IDEwMH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVnaXN0ZXJlZCBwdWJsaXNoZWRcIiA6IHJldHVybiB7ICBcImNvbG9yXCI6IFwiZ3JlZW5cIiwgXCJ3ZWlnaHRcIjogMSwgXCJvcGFjaXR5XCI6IDEwMH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVnaXN0ZXJlZCBwZW5kaW5nXCIgOiByZXR1cm4geyAgXCJjb2xvclwiOiBcImdyZWVuXCIsIFwid2VpZ2h0XCI6IDEsIFwib3BhY2l0eVwiOiAxMDB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkVhY2hGZWF0dXJlOiBmdW5jdGlvbiAoZmVhdHVyZSwgbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgIGxheWVyLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjb3VudHJ5LmNsaWNrJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfX0pXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sLmFkZFRvKG1hcClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmdlb2pzb24sIGZ1bmN0aW9uKHdvcmxkKXtcbiAgICAgICAgICAgICAgICBpZiAoIXdvcmxkKXtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdXBkYXRlR2VvSnNvbih3b3JsZCk7XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICB9O1xufSlcblxuIC5kaXJlY3RpdmUoJ21nQ2xlYXInLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnY2xlYXInKVxuICAgICAgfVxuICAgIH07XG4gIH0pXG4gIFxuICAuZGlyZWN0aXZlKCdtZ0JvbGQnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYm9sZCcpXG4gICAgICB9XG4gICAgfTtcbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ21nU2VhcmNoUmVzdWx0JywgZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvc2VhcmNoLXJlc3VsdHMuaHRtbCcsXG4gICAgICAgICAgcmVzdHJpY3Q6ICdBJ1xuICAgIH07XG5cbiAgfSlcblxuICAuZGlyZWN0aXZlKCdtZ1BhZ2luYXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9wYXJ0aWFscy9hZG1pbi1leHBpcnkuaHRtbFwiLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudHMsIGF0dHJzKXtcbiAgICAgICAgICAgICAgICAgdmFyICQgPSBzY29wZTtcbiAgICAgICAgICAgICAgICAgJC4kd2F0Y2goYXR0cnMuc29ydGVkQnlFeHBpcnksIGZ1bmN0aW9uKG5ld1ZhbCl7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXdWYWwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICQuZ3JvdXBPZkFycmF5cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaSA8IG5ld1ZhbC5sZW5ndGg7IGkrPSAkLml0ZW1zUGVyUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNsaWNlID0gbmV3VmFsLnNsaWNlKGksIGkrICQuaXRlbXNQZXJQYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZ3JvdXBPZkFycmF5cy5wdXNoKHNsaWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgJC5pdGVtcyA9ICQuZ3JvdXBPZkFycmF5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAkLnBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAkLiR3YXRjaCgncGFnZU51bWJlcicsIGZ1bmN0aW9uKG5ld1BhZ2Upe1xuICAgICAgICAgICAgICAgICAgICAgICQuaXRlbXMgPSAkLmdyb3VwT2ZBcnJheXNbbmV3UGFnZSAtMV07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgc29ydGVkQnlFeHBpcnk6ICc9JyxcbiAgICAgICAgICAgICAgICBpdGVtc1BlclBhZ2U6ICc9JyxcbiAgICAgICAgICAgICAgICBzaG93TW9kYWw6ICcmJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuZ3JvdXBPZkFycmF5cyA9IFtdO1xuICAgICAgICAgICAgICAgICQucHJldlBhZ2UgPSBmdW5jdGlvbihwYWdlTnVtYmVyKXtcbiAgICAgICAgICAgICAgICAgICAgJC5wYWdlTnVtYmVyLS07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAkLm5leHRQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcil7XG4gICAgICAgICAgICAgICAgICAgICQucGFnZU51bWJlcisrO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJC5maXJzdFBhZ2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkLnBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJC5sYXN0UGFnZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQucGFnZU51bWJlciA9ICQuZ3JvdXBPZkFycmF5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAkLmNoZWNrSWZGaXJzdCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZU51bWJlciA9PT0gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICQuY2hlY2tJZkxhc3QgPSBmdW5jdGlvbihwYWdlTnVtYmVyKXtcbiAgICAgICAgICAgICAgICAgICBpZiAocGFnZU51bWJlciA9PT0gJC5ncm91cE9mQXJyYXlzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJC5zaG93TW9kYWxXcmFwcGVyID0gZnVuY3Rpb24odG0pe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnVuYyA9ICQuc2hvd01vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmModG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG59KVxuXG4uZGlyZWN0aXZlKCdtZ0luY29tcGxldGVQYWdpbmF0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvcGFydGlhbHMvYWRtaW4taW5jb21wbGV0ZS5odG1sXCIsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLCBcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50cywgYXR0cnMpe1xuICAgICAgICAgICAgICAgIHZhciAkID0gc2NvcGU7XG4gICAgICAgICAgICAgICAgICQuJHdhdGNoKCdpbmNvbXBsZXRlTWFya3MnLCBmdW5jdGlvbihuZXdWYWwpe1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VmFsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICQuZ3JvdXBPZkFycmF5cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaSA8IG5ld1ZhbC5sZW5ndGg7IGkrPSAkLml0ZW1zUGVyUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNsaWNlID0gbmV3VmFsLnNsaWNlKGksIGkrICQuaXRlbXNQZXJQYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZ3JvdXBPZkFycmF5cy5wdXNoKHNsaWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgJC5pdGVtcyA9ICQuZ3JvdXBPZkFycmF5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAkLnBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAkLiR3YXRjaCgncGFnZU51bWJlcicsIGZ1bmN0aW9uKG5ld1BhZ2Upe1xuICAgICAgICAgICAgICAgICAgICAgICQuaXRlbXMgPSAkLmdyb3VwT2ZBcnJheXNbbmV3UGFnZSAtMV07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgaW5jb21wbGV0ZU1hcmtzOiAnPScsXG4gICAgICAgICAgICAgICAgaXRlbXNQZXJQYWdlOiAnPScsXG4gICAgICAgICAgICAgICAgc2hvd01vZGFsOiAnJidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICAkLmdyb3VwT2ZBcnJheXMgPSBbXTtcbiAgICAgICAgICAgICAgICAkLnByZXZQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcil7XG4gICAgICAgICAgICAgICAgICAgICQucGFnZU51bWJlci0tO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJC5uZXh0UGFnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpe1xuICAgICAgICAgICAgICAgICAgICAkLnBhZ2VOdW1iZXIrKztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICQuZmlyc3RQYWdlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJC5wYWdlTnVtYmVyID0gMTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICQubGFzdFBhZ2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkLnBhZ2VOdW1iZXIgPSAkc2NvcGUuZ3JvdXBPZkFycmF5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAkLmNoZWNrSWZGaXJzdCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZU51bWJlciA9PT0gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICQuY2hlY2tJZkxhc3QgPSBmdW5jdGlvbihwYWdlTnVtYmVyKXtcbiAgICAgICAgICAgICAgICAgICBpZiAocGFnZU51bWJlciA9PT0gJHNjb3BlLmdyb3VwT2ZBcnJheXMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAkLnNob3dNb2RhbFdyYXBwZXIgPSBmdW5jdGlvbih0bSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW5jID0gJHNjb3BlLnNob3dNb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICBmdW5jKHRtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgLmRpcmVjdGl2ZSgndGFicycsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgc2NvcGU6IHt9LFxuICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgICB2YXIgcGFuZXMgPSAkc2NvcGUucGFuZXMgPSBbXTtcbiBcbiAgICAgICAgJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKHBhbmUpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocGFuZXMsIGZ1bmN0aW9uKHBhbmUpIHtcbiAgICAgICAgICAgIHBhbmUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwYW5lLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuIFxuICAgICAgICB0aGlzLmFkZFBhbmUgPSBmdW5jdGlvbihwYW5lKSB7XG4gICAgICAgICAgaWYgKHBhbmVzLmxlbmd0aCA9PSAwKSAkc2NvcGUuc2VsZWN0KHBhbmUpO1xuICAgICAgICAgIHBhbmVzLnB1c2gocGFuZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0YWJiYWJsZVwiPicgK1xuICAgICAgICAgICc8dWwgY2xhc3M9XCJ0YWJzXCI+JyArXG4gICAgICAgICAgICAnPGxpIG5nLXJlcGVhdD1cInBhbmUgaW4gcGFuZXNcIiBuZy1jbGFzcz1cInthY3RpdmVwYW5lOnBhbmUuc2VsZWN0ZWR9XCI+JytcbiAgICAgICAgICAgICAgJzxhIGhyZWY9XCJcIiBuZy1jbGljaz1cInNlbGVjdChwYW5lKVwiPnt7cGFuZS50aXRsZX19PC9hPicgK1xuICAgICAgICAgICAgJzwvbGk+JyArXG4gICAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJ0YWItY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nLFxuICAgICAgcmVwbGFjZTogdHJ1ZVxuICAgIH07XG4gIH0pXG4gXG4gIC5kaXJlY3RpdmUoJ3BhbmUnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWlyZTogJ150YWJzJyxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICBzY29wZTogeyB0aXRsZTogJ0AnIH0sXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHRhYnNDdHJsKSB7XG4gICAgICAgIHRhYnNDdHJsLmFkZFBhbmUoc2NvcGUpO1xuICAgICAgfSxcbiAgICAgIHRlbXBsYXRlOlxuICAgICAgICAnPGRpdiBjbGFzcz1cInRhYi1wYW5lXCIgbmctY2xhc3M9XCJ7IGFjdGl2ZXRhYjogc2VsZWN0ZWR9XCIgbmctdHJhbnNjbHVkZT4nICtcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICByZXBsYWNlOiB0cnVlXG4gICAgfTtcbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ21nU2VhcmNoSW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9wYXJ0aWFscy9zZWFyY2gtaW5wdXQuaHRtbFwiLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6ICc9J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICAkLnNlYXJjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvc2VhcmNoJywgeyBxdWVyeTogJC5xdWVyeSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5ub3Jlc3VsdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLnNlYXJjaFJlc3VsdHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQubm9yZXN1bHRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuc2VhcmNoUmVzdWx0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlYWwgd2l0aCBlcnJvciBoYW5kbGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmNhblNlYXJjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgIHJldHVybiAkLnNlYXJjaEZvcm0uJGRpcnR5ICYmICQuc2VhcmNoRm9ybS4kdmFsaWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuY2FuRXhwaXJ5U2VhcmNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuICQuZXhwaXJ5Rm9ybS4kZGlydHkgJiYgJC5zZWFyY2hGb3JtLiR2YWxpZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5yZW1vdmVOb1Jlc3VsdHMgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQubm9yZXN1bHRzID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KVxuICBcbiAgLmRpcmVjdGl2ZSgnbWdTZWFyY2hSZXN1bHRzJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9zZWFyY2gtcmVzdWx0cy5odG1sJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0czogJz0nLFxuICAgICAgICAgICAgICAgIHNob3dNb2RhbDogJyYnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgdmFyICQgPSAkc2NvcGU7XG4gICAgICAgICAgICAgICAgJC5yZW1vdmVSZXN1bHRzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJC5zZWFyY2hSZXN1bHRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQuc2hvd01vZGFsV3JhcHBlciA9IGZ1bmN0aW9uKHRyYWRlbWFyayl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW5jID0gJC5zaG93TW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgZnVuYyh0cmFkZW1hcmspO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgIH1cbn0pXG5cbiAgICAuZGlyZWN0aXZlKCdtZ0FkbWluQWxlcnRXaWRnZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLCBcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2FkbWluLWFsZXJ0Lmh0bWwnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICB1c2VyOiAnPSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuJHdhdGNoKCd1c2VyLmFsZXJ0RnJlcXVlbmN5JywgZnVuY3Rpb24oZnJlcXVlbmN5KXtcbiAgICAgICAgICAgICAgICAgICAgIGlmICghZnJlcXVlbmN5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgJC51c2VyLmFsZXJ0T3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbiwgaSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uLmZ1bmN0aW9uTmFtZSA9PT0gXCJzZW5kRXhwaXJ5QWxlcnRzXCIpeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcmVxdWVuY3kubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC51c2VyLmFsZXJ0T3B0aW9uc1tpXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQudXNlci5hbGVydE9wdGlvbnNbaV0uY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJC5hbGVydCA9IHt9O1xuICAgICAgICAgICAgICAgICQuYWxlcnQubnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkLmFsZXJ0LnR5cGUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICQubnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkLnR5cGVzID0gW1wiZGF5c1wiLCBcIndlZWtzXCIsIFwibW9udGhzXCIsIFwieWVhcnNcIl07XG5cbiAgICAgICAgICAgICAgICAkLnJlbW92ZUFsZXJ0ID0gZnVuY3Rpb24oaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAkLnVzZXIuYWxlcnRGcmVxdWVuY3kuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgJC51cGRhdGVBbGVydHMoJC51c2VyKTtcbiAgICAgICAgICAgICAgICB9IFxuXG4gICAgICAgICAgICAgICAgJC5hZGRBbGVydCA9IGZ1bmN0aW9uKGFsZXJ0KXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsZXJ0Lm51bWJlciA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLm1lc3NhZ2UgPSBcIlBsZWFzZSBwcm92aWRlIGEgbnVtYmVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFsZXJ0LnR5cGUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICQudXNlci5hbGVydEZyZXF1ZW5jeS5wdXNoKHt0eXBlOiBhbGVydC50eXBlLCBudW1iZXI6IGFsZXJ0Lm51bWJlcn0pO1xuICAgICAgICAgICAgICAgICAgICAkLnVwZGF0ZUFsZXJ0cygkLnVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAkLm51bWJlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJC51cGRhdGVBbGVydHMgPSBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvdXBkYXRlQWxlcnQnLCB1c2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuYWxlcnQudHlwZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuYWxlcnQubnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC51c2VyID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgIH1cbn0pXG5cbiAgICAuZGlyZWN0aXZlKCdtZ0FjY291bnREZXRhaWxzV2lkZ2V0JywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9hY2NvdW50LWRldGFpbHMuaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHVzZXI6ICc9J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICAgJC51cGRhdGVQYXNzd29yZCA9IGZ1bmN0aW9uKG9sZCwgbm5ldywgZHVwKXtcbiAgICAgICAgICAgICAgICAgaWYgKG5uZXcgIT0gZHVwKXtcbiAgICAgICAgICAgICAgICAgICAgJC5wYXNzd29yZE1lc3NhZ2UgPSBcIk5ldyBwYXNzd29yZCBhbmQgZHVwbGljYXRlIGRvbid0IG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB2YXIgbG9hZCA9IHsgb2xkUFc6IG9sZCwgbmV3UFc6IG5uZXcgfTtcbiAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS91cGRhdGVQYXNzd29yZCcsIGxvYWQpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJC5wYXNzd29yZE1lc3NhZ2UgPSBkYXRhLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAkLnBhc3N3b3JkTWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgfVxufSlcblxuIC5kaXJlY3RpdmUoJ21nR3JvdXBTZWxlY3RvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsIFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvZ3JvdXAtc2VsZWN0b3IuaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIG1hcmtzOiAnPScsXG4gICAgICAgICAgICAgICAgZ29Ub0dyb3VwOiAnJicsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdAJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuZ29Ub0dyb3VwV3JhcHBlciA9IGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW5jID0gJC5nb1RvR3JvdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZnVuYyhvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG59KVxuXG5cbiAuZGlyZWN0aXZlKCdtZ0NvdW50cnlTZWxlY3RvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsIFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvY291bnRyeS1zZWxlY3Rvci5odG1sJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY291bnRyaWVzOiAnPScsXG4gICAgICAgICAgICAgICAgZ29Ub0dyb3VwOiAnJicsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdAJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuZ29Ub0dyb3VwV3JhcHBlciA9IGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW5jID0gJC5nb1RvR3JvdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZnVuYyhvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG59KVxuXG4gLmRpcmVjdGl2ZSgnbWdNYXJrTGlzdERpc3BsYXllcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL21hcmstbGlzdC1kaXNwbGF5ZXIuaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIG1hcmtzOiAnPScsXG4gICAgICAgICAgICAgICAgc2VuZE1hcmtzVG9TZXJ2ZXI6ICcmJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJGZpbHRlciwgJGh0dHApIHtcbiAgICAgICAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLm1hcmtTZXJ2ZXJXcmFwcGVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSAkLnNlbmRNYXJrc1RvU2VydmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmMoJC5tYXJrcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuZmlsdGVyTWFya3MgPSBmdW5jdGlvbihtYXJrcyl7XG4gICAgICAgICAgICAgICAgICAgICQubWFya1NlcnZlcldyYXBwZXIoJC5tYXJrcyk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQudG9nZ2xlTWFyayA9IGZ1bmN0aW9uKGluZGV4KXtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCQubWFya3MsIGZ1bmN0aW9uKG1hcmssIGkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrLmNoZWNrZWQgPSAhbWFyay5jaGVja2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAkLm1hcmtTZXJ2ZXJXcmFwcGVyKCQubWFya3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQudW50aWNrQWxsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJGZpbHRlcigndW50aWNrQWxsJykoJC5tYXJrcyk7XG4gICAgICAgICAgICAgICAgICAgICQubWFya1NlcnZlcldyYXBwZXIoJC5tYXJrcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJC50aWNrQWxsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJGZpbHRlcigndGlja0FsbCcpKCQubWFya3MpO1xuICAgICAgICAgICAgICAgICAgICAkLm1hcmtTZXJ2ZXJXcmFwcGVyKCQubWFya3MpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICB9XG4gICAgICB9XG59KVxuXG4gIFxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcblxuICAuZmFjdG9yeSgndHJhZGVtYXJrTW9kYWwnLCBbJ2J0Zk1vZGFsJywgZnVuY3Rpb24gKGJ0Zk1vZGFsKSB7XG4gICAgcmV0dXJuIGJ0Zk1vZGFsKHtcbiAgICAgIGNvbnRyb2xsZXI6ICd0cmFkZW1hcmtNb2RhbEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW9kYWxzL3RyYWRlbWFyay1tb2RhbC5odG1sJ1xuICAgIH0pO1xuICB9XSlcblxuICAuZmFjdG9yeSgnZWRpdFRyYWRlbWFya01vZGFsJywgWydidGZNb2RhbCcsIGZ1bmN0aW9uIChidGZNb2RhbCkge1xuICAgIHJldHVybiBidGZNb2RhbCh7XG4gICAgICBjb250cm9sbGVyOiAnZWRpdFRyYWRlbWFya01vZGFsQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9tb2RhbHMvZWRpdC10cmFkZW1hcmstbW9kYWwuaHRtbCdcbiAgICB9KTtcbiAgfV0pXG5cbiAgLmZhY3RvcnkoJ2VkaXRHcm91cE1vZGFsJywgWydidGZNb2RhbCcsIGZ1bmN0aW9uIChidGZNb2RhbCkge1xuICAgIHJldHVybiBidGZNb2RhbCh7XG4gICAgICBjb250cm9sbGVyOiAnZWRpdEdyb3VwQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9tb2RhbHMvZWRpdC1ncm91cC1tb2RhbC5odG1sJ1xuICAgIH0pO1xuICB9XSlcblxuICAgIC5mYWN0b3J5KCdlZGl0Q291bnRyeU1vZGFsJywgWydidGZNb2RhbCcsIGZ1bmN0aW9uIChidGZNb2RhbCkge1xuICAgICAgICByZXR1cm4gYnRmTW9kYWwoe1xuICAgICAgICAgIGNvbnRyb2xsZXI6ICdlZGl0Q291bnRyeUN0cmwnLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21vZGFscy9lZGl0LWNvdW50cnktbW9kYWwuaHRtbCdcbiAgICAgICAgfSk7XG4gICAgICB9XSlcblxuXHQuZmFjdG9yeSgndXBsb2FkSW1hZ2VNb2RhbCcsIFsnYnRmTW9kYWwnLCBmdW5jdGlvbihidGZNb2RhbCl7XG4gICAgICAgIHJldHVybiBidGZNb2RhbCh7ICAgICBcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICd1cGxvYWRJbWFnZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW9kYWxzL3VwbG9hZC1pbWFnZS1tb2RhbC5odG1sJ1xuICAgICAgICB9KTtcbiAgICB9XSlcblxuICAuZmFjdG9yeSgndXNlckdldHRlcicsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgICB2YXIgdXNlciA9IFtdO1xuICAgIHZhciB1c2VyR2V0dGVyID0ge1xuICAgICAgICBcbiAgICAgIFx0YW55VXNlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICBcdCAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2FueVVzZXJzJyk7XHRcbiAgICAgIFx0fSwgXG4gICAgICAgIGlzVXNlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvaXNVc2VyJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGlzQWRtaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2lzQWRtaW4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VXNlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZ2V0VXNlcicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHN0b3JlVXNlcjogZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgICAgIHVzZXJbMF0gPSBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVyblVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdXNlclswXTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlQ2xpZW50VXNlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHVzZXIuc3BsaWNlKDAsIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1c2VyR2V0dGVyO1xuICB9XSlcblxuICAuZmFjdG9yeSgnZ2VvSnNvbicsIFsnJGh0dHAnLCAndXNlckdldHRlcicsIGZ1bmN0aW9uKCRodHRwLCB1c2VyR2V0dGVyKXtcbiAgICB2YXIgZ2VvSnNvbiA9IHtcbiAgICAgICAgZ2V0V29ybGRHcm91cDogZnVuY3Rpb24ocG9ydGZvbGlvLCBncm91cCl7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3dvcmxkZ3JvdXAvJyArICBwb3J0Zm9saW8gKyAnLycgKyBncm91cClcbiAgICAgICAgICAgIFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0ICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RXhwaXJpZXNGb3JZZWFyOiBmdW5jdGlvbihwb3J0Zm9saW8sIHllYXIpe1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZXhwaXJpZXNGb3JZZWFyLycgKyBwb3J0Zm9saW8sIHsgeWVhcjogeWVhciB9KVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICByZXR1cm4gZ2VvSnNvbjtcbiAgfV0pXG5cbiAgLmZhY3RvcnkoJ3RyYWRlbWFya1JldmlzZXInLCBbJyRodHRwJywgJ3VzZXJHZXR0ZXInLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKCRodHRwLCB1c2VyR2V0dGVyLCAkcm9vdFNjb3BlKXtcbiAgICBcbiAgICBmdW5jdGlvbiBjdXJyeShmdW4pe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJnKXtcbiAgICAgICAgICAgIHJldHVybiBmdW4oYXJnKTtcbiAgICAgICAgfSAgIFxuICAgICAgfVxuXG4gICAgICB2YXIgdHJhZGVtYXJrUmV2aXNlciA9IHtcbiAgICAgICAgICBhbnlNYXJrczogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYW55TWFya3MnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGdldEdyb3VwOiBmdW5jdGlvbihwb3J0Zm9saW8sIGdyb3VwKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHJhZGVtYXJrcy8nICsgcG9ydGZvbGlvICsgJy8nICsgZ3JvdXApXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGdldENvdW50cnk6IGZ1bmN0aW9uKHBvcnRmb2xpbywgaXNvKXtcbiAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jb3VudHJ5LycgKyBwb3J0Zm9saW8gKyAnLycgKyBpc28pXG4gICAgICAgICAgICAgIFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHQgICAgICAgfSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVkaXRHcm91cDogZnVuY3Rpb24ocG9ydGZvbGlvLCBpZCwgdHJhZGVtYXJrKXtcbiAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZWRpdEdyb3VwLycgKyBwb3J0Zm9saW8gKyAnLycgKyBpZCwgeyB0cmFkZW1hcms6IHRyYWRlbWFyayB9KVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZWRpdE1hcmtzSW5Db3VudHJ5OiBmdW5jdGlvbihwb3J0Zm9saW8sIGlkLCB0cmFkZW1hcmspe1xuICAgICAgICAgICAgICB0cmFkZW1hcmsuY291bnRyeS5jb29yZGluYXRlcyA9IF8ubWFwKHRyYWRlbWFyay5jb3VudHJ5LmNvb3JkaW5hdGVzLnNwbGl0KFwiLFwiKSwgY3VycnkocGFyc2VJbnQpKTtcbiAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZWRpdE1hcmtzSW5Db3VudHJ5LycgKyBwb3J0Zm9saW8gKyAnLycgKyBpZCwgeyB0cmFkZW1hcms6IHRyYWRlbWFyayB9KVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2V0RXhwaXJ5RGF0ZXNGb3JHcm91cDogZnVuY3Rpb24ocG9ydGZvbGlvLCBncm91cCl7XG4gICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXhwaXJ5ZGF0ZXMvJyArIHBvcnRmb2xpbyArICcvJyArIGdyb3VwKVxuICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIGdldFRyYWRlbWFyazogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlbWFyay8nICsgaWQpXG4gICAgICAgICAgICAgIFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlbGV0ZU1hcms6IGZ1bmN0aW9uKHRyYWRlbWFyayl7XG4gICAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvdHJhZGVtYXJrLycgKyB0cmFkZW1hcmsuX2lkKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFkZE1hcms6IGZ1bmN0aW9uKHRyYWRlbWFyayl7XG4gICAgICAgICAgICAgICAgdHJhZGVtYXJrLmNsYXNzZXMgPSBfLm1hcCh0cmFkZW1hcmsuY2xhc3Nlcy5zcGxpdChcIixcIiksIGN1cnJ5KHBhcnNlSW50KSk7XG4gICAgICAgICAgICAgICAgdHJhZGVtYXJrLnBvcnRmb2xpbyA9IHVzZXJHZXR0ZXIucmV0dXJuVXNlcigpLmFjdGl2ZVBvcnRmb2xpbztcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS90cmFkZW1hcmsnLCB7IHRyYWRlbWFyazogdHJhZGVtYXJrIH0pXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlZGl0TWFyazogZnVuY3Rpb24odHJhZGVtYXJrKXtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFkZW1hcmsuY2xhc3NlcyA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgICAgICAgIHRyYWRlbWFyay5jbGFzc2VzID0gXy5tYXAodHJhZGVtYXJrLmNsYXNzZXMuc3BsaXQoXCIsXCIpLCBjdXJyeShwYXJzZUludCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhZGVtYXJrLmNvdW50cnkuY29vcmRpbmF0ZXMgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgICAgICB0cmFkZW1hcmsuY2xhc3NlcyA9IF8ubWFwKHRyYWRlbWFyay5jb3VudHJ5LmNvb3JkaW5hdGVzLnNwbGl0KFwiLFwiKSwgY3VycnkocGFyc2VJbnQpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0cmFkZW1hcmsudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL3RyYWRlbWFyay8nICsgdHJhZGVtYXJrLl9pZCwgeyB0cmFkZW1hcms6IHRyYWRlbWFyayB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgcmV0dXJuIHRyYWRlbWFya1JldmlzZXI7XG4gIH1dKVxuXG4gIC5mYWN0b3J5KCdwYXRoSG9sZGVyJywgWyd0cmFkZW1hcmtSZXZpc2VyJywgJ3VzZXJHZXR0ZXInLCBmdW5jdGlvbih0cmFkZW1hcmtSZXZpc2VyLCB1c2VyR2V0dGVyKXtcbiAgICAgIFxuICAgICAgdmFyIHBhdGggPSBbXTtcbiAgICAgIHZhciBwYXRoSG9sZGVyID0ge1xuICAgICAgICAgICBpbnNlcnRQYXRoOiBmdW5jdGlvbih1cmwpe1xuICAgICAgICAgICAgICAgIGlmICh1cmwgIT0gXCIvbG9naW5cIil7IHBhdGhbMF0gPSB1cmw7IH07XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgIHJldHVyblBhdGg6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhbMF07XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgIGV4aXN0aW5nUGF0aDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICByZXR1cm4gcGF0aEhvbGRlcjtcbiAgfV0pXG4gIFxuICAuZmFjdG9yeSgnY2hhcnRHZXR0ZXInLCBbJyRmaWx0ZXInLCAnJGh0dHAnLCAndHJhZGVtYXJrUmV2aXNlcicsIGZ1bmN0aW9uKCRmaWx0ZXIsICRodHRwLCB0cmFkZW1hcmtSZXZpc2VyKXtcbiAgICAgICAgdmFyIGNoYXJ0R2V0dGVyID0ge1xuICAgICAgICAgICAgYmFyQ2hhcnREYXRhRm9yR3JvdXA6IGZ1bmN0aW9uKHBvcnRmb2xpbywgZ3JvdXApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFkZW1hcmtSZXZpc2VyLmdldEV4cGlyeURhdGVzRm9yR3JvdXAocG9ydGZvbGlvLCBncm91cClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFyRGF0YSA9ICRmaWx0ZXIoJ2V4dHJhY3RFeHBpcnlEYXRlcycpKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bGxCYXJEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVscyA6ICRmaWx0ZXIoJ2V4dHJhY3RZZWFycycpKGJhckRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzIDogXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt7ZGF0YSA6ICRmaWx0ZXIoJ2V4dHJhY3RMZW5ndGgnKShiYXJEYXRhKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvciA6IFwicmdiKDU3LCAxNTUsIDEwNClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVsbEJhckRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhckNoYXJ0T3B0aW9uczogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlU2hvd0dyaWRMaW5lcyA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMaW5lQ29sb3I6IFwiYmxhY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGluZVdpZHRoIDogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlT3ZlcmxheSA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZU92ZXJyaWRlIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlU3RlcHMgOiA0LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVTdGVwV2lkdGggOiAyNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlU3RhcnRWYWx1ZSA6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJTaG93U3Ryb2tlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJEYXRhc2V0U3BhY2luZyA6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUZvbnRTaXplIDogMTYsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25TdGVwcyA6IDEyMFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgIHBpZUNoYXJ0RGF0YTogZnVuY3Rpb24odHJhZGVtYXJrcyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gJGZpbHRlcignZ3JvdXBCeVN0YXR1cycpKHRyYWRlbWFya3MpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkLCBmdW5jdGlvbihzZXQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnZhbHVlID0gc2V0Lm51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyWzBdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyclswXS5jb2xvciA9IFwiI0YzODYzMFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJbMV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyWzFdLmNvbG9yID0gXCIjRTBFNENDXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyclsyXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJbMl0uY29sb3IgPSBcIiM2OUQyRTdcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgIHBpZUNoYXJ0U3VidGl0bGVzOiBmdW5jdGlvbih0cmFkZW1hcmtzKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRmaWx0ZXIoJ2dyb3VwQnlTdGF0dXMnKSh0cmFkZW1hcmtzKTtcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICBwaWVDaGFydE9wdGlvbnM6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50U2hvd1N0cm9rZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RlcHMgOiAyMDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hhcnRHZXR0ZXI7XG4gIH1dKVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcblx0LmZpbHRlcignZnJvbU5vdycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGlucHV0KXtcblx0XHRcdGlucHV0LmZvckVhY2goZnVuY3Rpb24oaSl7XG5cdFx0XHRcdHZhciBkYXRlID0gbW9tZW50KGkuZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlLCBcIk1NL0REL1lZWVlcIikuZnJvbU5vdygpO1xuXHRcdFx0XHRpLmZyb21Ob3cgPSBkYXRlO1xuXHRcdFx0XHR9KVxuXHRcdFx0cmV0dXJuIGlucHV0O1xuXHRcdH1cblx0fSlcblx0XG5cdC5maWx0ZXIoJ3VuaXF1ZU1hcmtzJywgZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYXJyKXtcblx0ICAgICAgICAgcmV0dXJuIF8ua2V5cyhfLmdyb3VwQnkoYXJyLCAnbWFyaycpKVxuXHQgICAgfVxuXHR9KVxuXHRcblx0LmZpbHRlcignZ3JvdXBCeVN0YXR1cycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuXHRcdFx0dmFyIGdyb3VwID0gXy5ncm91cEJ5KHRyYWRlbWFya3MsICdzdGF0dXMnKTtcblx0XHRcdHZhciBhcnIgPSBbXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBncm91cCl7XG5cdFx0XHQgICAgIHZhciBvID0ge307XG5cdFx0XHQgICAgIG8uc3RhdHVzID0ga2V5O1xuXHRcdFx0ICAgICBvLm51bWJlciA9IGdyb3VwW2tleV0ubGVuZ3RoO1xuXHRcdCAgICAgICAgICAgICBhcnIucHVzaChvKTtcblx0XHRcdCAgICB9XG5cdFx0ICAgIHJldHVybiBhcnI7XHRcblx0ICAgIH1cblx0fSlcblx0XG5cdC5maWx0ZXIoJ2V4dHJhY3RFeHBpcnlEYXRlcycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG9iail7XG5cdFx0XHR2YXIgYXJyID0gW107XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gb2JqKXtcblx0XHQgICAgICAgIHZhciBvID0ge31cblx0XHQgICAgICAgIG8ueWVhciA9IGtleTtcblx0XHQgICAgICAgIG8ubnVtYmVyID0gb2JqW2tleV0ubGVuZ3RoO1xuXHRcdCAgICAgICAgYXJyLnB1c2gobyk7XG5cdFx0ICAgIH1cblx0XHQgICAgcmV0dXJuIGFycjtcblx0XHR9XG5cdH0pXG5cdFxuXHQuZmlsdGVyKCdleHRyYWN0WWVhcnMnLCBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBmdW5jdGlvbihhcnIpe1xuXHRcdFx0dmFyIGFyID0gXy5tYXAoYXJyLCBmdW5jdGlvbihhKXtcblx0XHRcdFx0cmV0dXJuIGEueWVhcjtcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gYXI7XG5cdFx0fVxuXHR9KVxuXHRcblx0LmZpbHRlcignZXh0cmFjdExlbmd0aCcsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGFycil7XG5cdFx0XHR2YXIgYXIgPSBfLm1hcChhcnIsIGZ1bmN0aW9uKGEpe1xuXHRcdFx0XHRyZXR1cm4gYS5udW1iZXI7XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIGFyO1xuXHRcdH1cdFxuXHR9KVxuXHRcblx0LmZpbHRlcignZXh0cmFjdFJlZ2lzdGVyZWRNYXJrcycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuXHRcdHZhciBhcnIgPSBbXTtcblx0XHR0cmFkZW1hcmtzLmZvckVhY2goZnVuY3Rpb24odG0pe1xuXHRcdCAgICAgaWYgKHRtLnN0YXR1cyA9PT0gXCJSZWdpc3RlcmVkXCIgJiYgdG0uZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlKXtcblx0XHQgICAgICAgICBhcnIucHVzaCh0bSk7XG5cdFx0ICAgICB9XG5cdFx0IH0pXG4gICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICAgfVxuXHR9KVxuXG5cdC5maWx0ZXIoJ3NvcnRCeUV4cGlyeURhdGUnLCBmdW5jdGlvbigpe1xuXHRcdHZhciBkYXRlX3NvcnRfZGVzYyA9IGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0ICB2YXIgZXhwaXJ5T25lID0gbW9tZW50KGEuZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlLCBcIk1NL0REL1lZWVlcIik7XG5cdFx0ICB2YXIgZXhwaXJ5VHdvID0gbW9tZW50KGIuZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlLCBcIk1NL0REL1lZWVlcIik7XG5cdFx0ICBpZiAobW9tZW50KGEuZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlLCBcIk1NL0REL1lZWVlcIikgPiBtb21lbnQoYi5leHBpcnlEYXRlLnN0cmluZ0RhdGUsIFwiTU0vREQvWVlZWVwiKSkgcmV0dXJuIDE7XG5cdFx0ICBpZiAobW9tZW50KGEuZXhwaXJ5RGF0ZS5zdHJpbmdEYXRlLCBcIk1NL0REL1lZWVlcIikgPCBtb21lbnQoYi5leHBpcnlEYXRlLnN0cmluZ0RhdGUsIFwiTU0vREQvWVlZWVwiKSkgcmV0dXJuIC0xO1xuXHRcdCAgcmV0dXJuIDA7XG5cdFx0fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24odHJhZGVtYXJrcyl7XG5cdFx0XHR0cmFkZW1hcmtzLnNvcnQoZGF0ZV9zb3J0X2Rlc2MpO1xuXHRcdFx0cmV0dXJuIHRyYWRlbWFya3M7XG5cdFx0fVxuXHR9KVxuXG5cdC5maWx0ZXIoJ2luY29tcGxldGVNYXJrcycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuXHQgICAgICAgICB2YXIgYXJyID0gW107XG5cdFx0ICAgICB0cmFkZW1hcmtzLmZvckVhY2goZnVuY3Rpb24odG0pe1xuXHRcdCAgICAgXHQgIHRtLmlzc3VlcyA9IFtdO1xuXHRcdCAgICAgXHQgIGlmICh0bS5zdGF0dXMgPT09IFwiUmVnaXN0ZXJlZFwiICYmIHRtLmV4cGlyeURhdGUuc3RyaW5nRGF0ZSA9PT0gZmFsc2Upe1xuXHRcdCAgICAgXHQgIFx0dG0uaXNzdWVzLnB1c2goXCJSZWdpc3RlcmVkIGJ1dCBubyBleHBpcnkgZGF0ZVwiKTtcblx0XHQgICAgIFx0ICB9XG4gICAgICAgICAgICAgICAgICBpZiAodG0uYXBwbGljYXRpb25OdW1iZXIgPT09IFwiLS1cIil7XG4gICAgICAgICAgICAgICAgICAgICAgdG0uaXNzdWVzLnB1c2goXCJBcHBsaWNhdGlvbiBudW1iZXIgdW5rbm93blwiKVxuICAgICAgICAgICAgICAgICAgfVxuXHRcdCAgICAgXHQgIGlmICh0bS5jbGFzc2VzWzBdID09PSBudWxsKXtcblx0XHQgICAgIFx0ICBcdHRtLmlzc3Vlcy5wdXNoKFwiQ2xhc3NlcyBhcmUgdW5rbm93blwiKTtcblx0XHQgICAgIFx0ICB9XG5cdFx0ICAgICBcdCAgaWYgKG1vbWVudCh0bS5leHBpcnlEYXRlLnN0cmluZ0RhdGUsIFwiTU0vREQvWVlZWVwiKS55ZWFyKCkgLSBtb21lbnQoKS55ZWFyKCkgPiAxMCApe1xuXHRcdCAgICAgXHQgIFx0dG0uaXNzdWVzLnB1c2goXCJFeHBpcnkgbW9yZSB0aGFuIDEwIHllYXJzIGF3YXlcIik7XG5cdFx0ICAgICBcdCAgfVxuXHRcdCAgICAgXHQgIGlmICh0bS5pc3N1ZXMubGVuZ3RoKXtcblx0XHQgICAgIFx0ICBcdGFyci5wdXNoKHRtKVxuXHRcdCAgICAgXHQgIH1cblx0XHQgICAgIFx0ICBcblx0XHQgICAgIH0pXG5cdFx0ICAgICByZXR1cm4gYXJyO1xuXHRcdH1cblx0fSlcblx0XG5cdC5maWx0ZXIoJ2dyb3VwQnlNYXJrcycsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRyYWRlbWFya3Mpe1xuXHRcdCAgICAgdmFyIGFyciA9IFtdO1xuXHRcdCAgICAgdmFyIGtleXMgPSBfLmtleXMoXy5ncm91cEJ5KHRyYWRlbWFya3MsICdtYXJrJykpO1xuXHRcdCAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGspe1xuXHRcdCAgICAgXHQgdmFyIG8gPSB7fTtcblx0XHQgICAgIFx0IG8ubmFtZSA9IGs7XG5cdFx0ICAgICBcdCBvLmNoZWNrZWQgPSB0cnVlO1xuXHRcdCAgICAgXHQgYXJyLnB1c2gobyk7XG5cdFx0ICAgICB9KVxuXG5cdFx0ICAgICByZXR1cm4gYXJyO1xuXHRcdH1cblx0fSlcblx0XG5cdC5maWx0ZXIoJ2V4dHJhY3RDaGVja2VkTWFya3MnLCBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBmdW5jdGlvbihhcil7XG5cdCAgICAgICAgICAgIHZhciBhcnIgPSBbXTtcblx0ICAgICAgICAgICAgYXIuZm9yRWFjaChmdW5jdGlvbihhKXtcblx0ICAgICAgICAgICAgICAgIGlmIChhLmNoZWNrZWQgPT09IHRydWUpe1xuXHQgICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKGEubmFtZSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgICAgIHJldHVybiBhcnI7XG5cdCAgICAgICAgfVxuXHR9KVxuXHRcblx0LmZpbHRlcigndW5UaWNrQWxsRXhjZXB0U2VsZWN0ZWQnLCBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBmdW5jdGlvbihhciwgaXRlbSl7XG5cdFx0XHR2YXIgYXJyID0gW107XG5cdFx0XHRhci5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xuXHRcdFx0XHRpZiAoaXRlbS5uYW1lID09PSBhLm5hbWUpe1xuXHRcdFx0XHRcdGEuY2hlY2tlZCA9IHRydWU7XG5cdFx0XHRcdFx0YXJyLnB1c2goYSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdCAgICAgYS5jaGVja2VkID0gZmFsc2U7XG5cdFx0XHRcdCAgICAgYXJyLnB1c2goYSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gYXJyO1xuXHRcdH1cblx0fSlcblx0XG5cdC5maWx0ZXIoJ3VudGlja0FsbCcsIGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGFyKXtcblx0ICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuXHQgICAgICAgICAgICBhci5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xuXHQgICAgICAgICAgICAgICAgaWYgKGEuY2hlY2tlZCA9PT0gdHJ1ZSl7XG5cdCAgICAgICAgICAgICAgICAgICAgYS5jaGVja2VkID0gZmFsc2U7XG5cdCAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goYSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgICAgIHJldHVybiBhcnI7XG5cdCAgICAgICAgfVxuXHR9KVxuXHRcblx0XG5cdC5maWx0ZXIoJ3RpY2tBbGwnLCBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBmdW5jdGlvbihhcil7XG5cdCAgICAgICAgICAgIHZhciBhcnIgPSBbXTtcblx0ICAgICAgICAgICAgYXIuZm9yRWFjaChmdW5jdGlvbihhKXtcblx0ICAgICAgICAgICAgICAgIGlmIChhLmNoZWNrZWQgPT09IGZhbHNlKXtcblx0ICAgICAgICAgICAgICAgICAgICBhLmNoZWNrZWQgPSB0cnVlO1xuXHQgICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKGEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgICAgICByZXR1cm4gYXJyO1xuXHQgICAgICAgIH1cblx0fSlcblxuICAgIC5maWx0ZXIoJ3VuY2hlY2tBbGxFeGNlcHRQcmVzZW50JywgZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24obWFya0xpc3QsIHJldHVybmVkTWFya3Mpe1xuXHRcdFx0dmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG1hcmtMaXN0LCBmdW5jdGlvbihtKXsgXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJldHVybmVkTWFya3MsIGZ1bmN0aW9uKHRtKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRtLm1hcmsgPT09IG0ubmFtZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2gobSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNoZWNrZWQgPSBmYWxzZTtcblx0XHRcdFx0XHR9ICBcbiAgICAgICAgICAgICAgICB9KSAgXG4gICAgICAgICAgICB9KVxuXHRcdFx0cmV0dXJuIGFycjtcblx0XHR9XG5cdH0pXG5cblx0LmZpbHRlcignZXh0cmFjdENvdW50cmllcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtYXJrcyl7XG4gICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobWFya3MsIGZ1bmN0aW9uKHRtKXtcblx0XHRcdFx0YXJyLnB1c2godG0uY291bnRyeS5uYW1lKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9IFxuICAgIH0pXG4gICAgXG4gICAgXG4gICAgLmZpbHRlcignY2hlY2tJZkVVJywgZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvdW50cmllcyl7XG4gICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goY291bnRyaWVzLCBmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICBpZiAoYyAhPSBcIkV1cm9wZWFuIFVuaW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfVxuICAgIH0pXG5cblxuXHQuZmlsdGVyKCdleHRyYWN0Q291bnRyeURhdGEnLCBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odHJhZGVtYXJrcyl7XG4gICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJhZGVtYXJrcywgZnVuY3Rpb24odG0pe1xuICAgICAgICAgICAgICAgIGFyci5wdXNoKHRtLmNvdW50cnkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBcblxuXG5cdFxuXHRcblx0XG5cblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgXG4gICAgLmNvbnRyb2xsZXIoJ3RyYWRlbWFya01vZGFsQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRyb290U2NvcGUnLCAndXNlckdldHRlcicsICd0cmFkZW1hcmtSZXZpc2VyJywgJyRodHRwJywgJ2VkaXRUcmFkZW1hcmtNb2RhbCcsICd0cmFkZW1hcmtNb2RhbCcsIFxuICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUsIHVzZXJHZXR0ZXIsIHRyYWRlbWFya1JldmlzZXIsICRodHRwLCBlZGl0VHJhZGVtYXJrTW9kYWwsIHRyYWRlbWFya01vZGFsKSB7XG4gICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgIFxuICAgICAgJC5hbHBoYTIgPSAkLnRyYWRlbWFyay5jb3VudHJ5LmFscGhhMi50b0xvd2VyQ2FzZSgpO1xuICAgICAgXG4gICAgICAkLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdHJhZGVtYXJrTW9kYWwuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAkcm9vdFNjb3BlLm1vZGFsID0gZmFsc2U7XG4gICAgICB9O1xuICAgIFxuICAgICAgJC5vcGVuRWRpdFRyYWRlbWFya01vZGFsID0gZnVuY3Rpb24odHJhZGVtYXJrKXtcbiAgICAgICAgdXNlckdldHRlci5pc0FkbWluKCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRyYWRlbWFya01vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICBlZGl0VHJhZGVtYXJrTW9kYWwuYWN0aXZhdGUoe3RyYWRlbWFyazogdHJhZGVtYXJrfSlcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAgICAgJC5tZXNzYWdlID0gcmVzLmRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgIFxuICAgICAgJC5kZWxldGVUcmFkZW1hcmsgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICB1c2VyR2V0dGVyLmlzQWRtaW4oKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICB0cmFkZW1hcmtSZXZpc2VyLmRlbGV0ZU1hcmsodHJhZGVtYXJrKVxuICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSBkYXRhLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICAkLm1lc3NhZ2UgPSByZXMuZGF0YS5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXHR0cmFkZW1hcmtNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgXHQkcm9vdFNjb3BlLm1vZGFsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XSlcbiAgXG4gICAgXG4gICAgLmNvbnRyb2xsZXIoJ2VkaXRUcmFkZW1hcmtNb2RhbEN0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRodHRwJywgJ3RyYWRlbWFya1JldmlzZXInLCAnZWRpdFRyYWRlbWFya01vZGFsJyxcbiAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRodHRwLCB0cmFkZW1hcmtSZXZpc2VyLCBlZGl0VHJhZGVtYXJrTW9kYWwpIHtcbiAgICAgICAgICB2YXIgJCA9ICRzY29wZTtcbiAgICAgICAgICAkLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVkaXRUcmFkZW1hcmtNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLm1vZGFsID0gZmFsc2U7XG4gICAgICAgICAgfTtcbiAgICBcbiAgICAgICAgICAkLnN0YXR1c2VzID0gW1wiUmVnaXN0ZXJlZFwiLCBcIlB1Ymxpc2hlZFwiLCBcIlBlbmRpbmdcIl07XG4gICAgXG4gICAgXG4gICAgICAgICRodHRwLmdldCgnL2FwaS9jb3VudHJ5ZGF0YScpXG4gICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAkLmNvdW50cnlkYXRhID0gZGF0YTtcbiAgICAgICAgICAgIH0pXG4gICAgXG4gICAgICAgICQuZWRpdFRyYWRlbWFyayA9IGZ1bmN0aW9uKHRyYWRlbWFyayl7XG4gICAgICAgICAgICB0cmFkZW1hcmtSZXZpc2VyLmVkaXRNYXJrKHRyYWRlbWFyaylcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgJC5tZXNzYWdlID0gZGF0YS5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgIFxuICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCdlZGl0R3JvdXBDdHJsJywgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckaHR0cCcsICd0cmFkZW1hcmtSZXZpc2VyJywgJ2VkaXRHcm91cE1vZGFsJyxcbiAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGh0dHAsIHRyYWRlbWFya1JldmlzZXIsIGVkaXRHcm91cE1vZGFsKXtcbiAgICAgICAgICAgICAgdmFyICQgPSAkc2NvcGU7XG4gICAgICAgICAgICAgICQuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0R3JvdXBNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubW9kYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgJC5lZGl0R3JvdXAgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICAgICAgICAgICAgdHJhZGVtYXJrUmV2aXNlci5lZGl0R3JvdXAoJC5pZCwgdHJhZGVtYXJrKVxuICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAkLm1lc3NhZ2UgPSBkYXRhLm1zZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdFx0XHR9KVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCdlZGl0Q291bnRyeUN0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ3RyYWRlbWFya1JldmlzZXInLCAnZWRpdENvdW50cnlNb2RhbCcsXG4gICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIHRyYWRlbWFya1JldmlzZXIsIGVkaXRDb3VudHJ5TW9kYWwpe1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0Q291bnRyeU1vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5tb2RhbCA9IGZhbHNlO1xuICAgICAgICAgIFx0XHR9O1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuZWRpdENvdW50cnkgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICAgICAgICAgICAgICB0cmFkZW1hcmtSZXZpc2VyLmVkaXRNYXJrc0luQ291bnRyeSgkLmlkLCB0cmFkZW1hcmspXG4gICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubXNnO1xuXHRcdFx0XHR9KVxuICAgICAgICAgICAgIH1cbiAgICAgICAgIH1dKVxuXG5cdC5jb250cm9sbGVyKCdlZGl0Q291bnRyeUN0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ3RyYWRlbWFya1JldmlzZXInLCAnZWRpdENvdW50cnlNb2RhbCcsXG4gICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIHRyYWRlbWFya1JldmlzZXIsIGVkaXRDb3VudHJ5TW9kYWwpe1xuICAgICAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgICQuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0Q291bnRyeU1vZGFsLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5tb2RhbCA9IGZhbHNlO1xuICAgICAgICAgIFx0XHR9O1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuZWRpdENvdW50cnkgPSBmdW5jdGlvbih0cmFkZW1hcmspe1xuICAgICAgICAgICAgICAgICAgICB0cmFkZW1hcmtSZXZpc2VyLmVkaXRNYXJrc0luQ291bnRyeSgkLmlkLCB0cmFkZW1hcmspXG4gICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubXNnO1xuXHRcdFx0XHR9KVxuICAgICAgICAgICAgIH1cbiAgICAgICAgIH1dKVxuXG5cdFx0LmNvbnRyb2xsZXIoJ3VwbG9hZEltYWdlQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICckcm9vdFNjb3BlJywgJyRodHRwJywgJ3VwbG9hZEltYWdlTW9kYWwnLFxuICAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsICRyb290U2NvcGUsICRodHRwLCB1cGxvYWRJbWFnZU1vZGFsKXtcbiAgICAgICAgICAgIHZhciAkID0gJHNjb3BlO1xuICAgICAgICAgICAgJC5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdXBsb2FkSW1hZ2VNb2RhbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5tb2RhbCA9IGZhbHNlO1xuICAgICAgXHRcdH07XG4gICAgICAgICBcdFxuICAgIFx0XHQkLnVwbG9hZENvbXBsZXRlID0gZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgICAgICAgICAgICAkLmNvbnRlbnRzID0gY29udGVudDtcbiAgICAgICAgICAgICAgICAgJC5tZXNzYWdlID0gXCJJbWFnZSB1cGxvYWRlZFwiO1xuICAgICAgICAgICAgICAgICAkLnVybCA9IGNvbnRlbnQudXJsO1xuICAgICBcdFx0fVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLnNhdmVMb2dvID0gZnVuY3Rpb24obWFyaywgdXJsKXtcbiAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9hZGRMb2dvVG9Hcm91cC8nICsgJHJvdXRlUGFyYW1zLnBvcnRmb2xpbyArIFwiL1wiICsgbWFyaywgeyB1cmw6IHVybH0pXG4gICAgICAgICAgICAgICAgXHQuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQubWVzc2FnZSA9IGRhdGEubXNnO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgfV0pIiwiXG5hcHAuY29uZmlnKFsnJGxvY2F0aW9uUHJvdmlkZXInLCAnJHJvdXRlUHJvdmlkZXInLCBmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpe1xuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkcm91dGVQcm92aWRlci5cbiAgICAgICAgd2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2xhbmRpbmctcGFnZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdjcmVhdGVBY2NvdW50Q3RybCdcbiAgICAgICAgfSkuXG4gICAgd2hlbignL2RlbW8vOnBvcnRmb2xpbycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2FkbWluLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2FkbWluQ3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgdXNlcjogZnVuY3Rpb24odXNlckdldHRlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyR2V0dGVyLmdldFVzZXIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRyYWRlbWFya3M6IGZ1bmN0aW9uKCRyb3V0ZSwgdHJhZGVtYXJrUmV2aXNlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFkZW1hcmtSZXZpc2VyLmdldEdyb3VwKCRyb3V0ZS5jdXJyZW50LnBhcmFtcy5wb3J0Zm9saW8sIFwiQUxMIE1BUktTXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd29ybGQ6IGZ1bmN0aW9uKCRyb3V0ZSwgZ2VvSnNvbil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZW9Kc29uLmdldFdvcmxkR3JvdXAoJHJvdXRlLmN1cnJlbnQucGFyYW1zLnBvcnRmb2xpbywgXCJBTEwgTUFSS1NcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBiYXJDaGFydERhdGE6IGZ1bmN0aW9uKCRyb3V0ZSwgY2hhcnRHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hhcnRHZXR0ZXIuYmFyQ2hhcnREYXRhRm9yR3JvdXAoJHJvdXRlLmN1cnJlbnQucGFyYW1zLnBvcnRmb2xpbywgXCJBTEwgTUFSS1NcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBiYXJDaGFydE9wdGlvbnM6IGZ1bmN0aW9uKGNoYXJ0R2V0dGVyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYXJ0R2V0dGVyLmJhckNoYXJ0T3B0aW9ucygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuXG4gICAgICAgIHdoZW4oJy9tYXAvOnBvcnRmb2xpbycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL21hcC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdtYXBDdHJsJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICB1c2VyOiBmdW5jdGlvbih1c2VyR2V0dGVyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJHZXR0ZXIuaXNVc2VyKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3b3JsZDogZnVuY3Rpb24oJHJvdXRlLCBnZW9Kc29uKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdlb0pzb24uZ2V0V29ybGRHcm91cCgkcm91dGUuY3VycmVudC5wYXJhbXMucG9ydGZvbGlvLCBcIkFMTCBNQVJLU1wiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRyYWRlbWFya3M6IGZ1bmN0aW9uKCRyb3V0ZSwgdHJhZGVtYXJrUmV2aXNlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFkZW1hcmtSZXZpc2VyLmdldEdyb3VwKCRyb3V0ZS5jdXJyZW50LnBhcmFtcy5wb3J0Zm9saW8sIFwiQUxMIE1BUktTXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuXG4gICAgICAgIHdoZW4oJy9sb2dpbicsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2xvZ2luLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgYW55VXNlcnM6IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5hbnlVc2VycygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuXG4gICAgICAgICAgd2hlbignL3Jlc2V0LXBhc3N3b3JkJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvcGFzc3dvcmQtcmVzZXQtcmVxdWVzdC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwYXNzd29yZFJlc2V0Q3RybCdcbiAgICAgICAgfSkuXG4gICAgICAgIHdoZW4oJy9wYXNzd29yZC86aWQnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9jaGFuZ2UtcGFzc3dvcmQuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAncGFzc3dvcmRDdHJsJ1xuICAgICAgICB9KS5cbiAgICAgICAgd2hlbignL2FkbWluL3VzZXInLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9hZGQtdXNlci5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdjcmVhdGVVc2VyQ3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgYWRtaW46IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5pc0FkbWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5cbiAgICAgICAgd2hlbignL3VwbG9hZCcsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL3VwbG9hZC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICd1cGxvYWRDdHJsJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBhZG1pbjogZnVuY3Rpb24odXNlckdldHRlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyR2V0dGVyLmlzQWRtaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLiBcbiAgICAgICAgd2hlbignL2FkbWluL3RyYWRlbWFyaycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2FkZC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdhZGRDdHJsJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBhZG1pbjogZnVuY3Rpb24odXNlckdldHRlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyR2V0dGVyLmlzQWRtaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLlxuICAgXHRcdHdoZW4oJy9hZG1pbi90cmFkZW1hcmsvOmlkJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvdmlldy10cmFkZW1hcmsuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAndHJhZGVtYXJrVmlld0N0cmwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGFkbWluOiBmdW5jdGlvbih1c2VyR2V0dGVyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJHZXR0ZXIuaXNBZG1pbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuXG4gICAgICAgIHdoZW4oJy9hZG1pbi9ncm91cC86cG9ydGZvbGlvLzpncm91cCcsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL3ZpZXctZ3JvdXAuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZ3JvdXBWaWV3Q3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgYWRtaW46IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5pc0FkbWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5cbiAgICAgICAgd2hlbignL2FkbWluL2NvdW50cnkvOnBvcnRmb2xpby86aXNvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvdmlldy1jb3VudHJ5Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2NvdW50cnlWaWV3Q3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgYWRtaW46IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5pc0FkbWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5cbiAgICB3aGVuKCcvYWRtaW4vZXhwaXJpbmcvOnBvcnRmb2xpby86eWVhcicsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2V4cGlyeS1tYXAuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZXhwaXJ5Q3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgYWRtaW46IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5pc0FkbWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5cbiAgICAgICAgd2hlbignL2FkbWluLzpwb3J0Zm9saW8nLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9hZG1pbi5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdhZG1pbkN0cmwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGFkbWluOiBmdW5jdGlvbih1c2VyR2V0dGVyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJHZXR0ZXIuaXNBZG1pbigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogZnVuY3Rpb24odXNlckdldHRlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyR2V0dGVyLmdldFVzZXIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRyYWRlbWFya3M6IGZ1bmN0aW9uKCRyb3V0ZSwgdHJhZGVtYXJrUmV2aXNlcil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFkZW1hcmtSZXZpc2VyLmdldEdyb3VwKCRyb3V0ZS5jdXJyZW50LnBhcmFtcy5wb3J0Zm9saW8sIFwiQUxMIE1BUktTXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd29ybGQ6IGZ1bmN0aW9uKCRyb3V0ZSwgZ2VvSnNvbil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZW9Kc29uLmdldFdvcmxkR3JvdXAoJHJvdXRlLmN1cnJlbnQucGFyYW1zLnBvcnRmb2xpbywgXCJBTEwgTUFSS1NcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBiYXJDaGFydERhdGE6IGZ1bmN0aW9uKCRyb3V0ZSwgY2hhcnRHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hhcnRHZXR0ZXIuYmFyQ2hhcnREYXRhRm9yR3JvdXAoJHJvdXRlLmN1cnJlbnQucGFyYW1zLnBvcnRmb2xpbywgXCJBTEwgTUFSS1NcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBiYXJDaGFydE9wdGlvbnM6IGZ1bmN0aW9uKGNoYXJ0R2V0dGVyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYXJ0R2V0dGVyLmJhckNoYXJ0T3B0aW9ucygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuXG4gICAgICAgIHdoZW4oJy9jcmVhdGUtYWNjb3VudCcsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2NyZWF0ZS1hY2NvdW50Lmh0bWwnLCBcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdjcmVhdGVBY2NvdW50Q3RybCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgKS5cbiAgICAgICAgd2hlbignL3NlbGVjdC1wb3J0Zm9saW8nLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDonL3BhcnRpYWxzL3NlbGVjdC1wb3J0Zm9saW8uaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnc2VsZWN0UG9ydGZvbGlvQ3RybCcsXG4gICAgICAgICAgICByZXNvbHZlOntcbiAgICAgICAgICAgICAgICAgYWRtaW46IGZ1bmN0aW9uKHVzZXJHZXR0ZXIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlckdldHRlci5pc0FkbWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5cbiAgICAgICAgb3RoZXJ3aXNlKHtcbiAgICAgICAgICAgIHJlZGlyZWN0VG86ICcvJ1xuICAgIH0pO1xufV0pO1xuXG5hcHAuY29uZmlnKFsnJG1vbWVudFByb3ZpZGVyJywgZnVuY3Rpb24oJG1vbWVudFByb3ZpZGVyKXtcbiAgICAkbW9tZW50UHJvdmlkZXJcbiAgICAgIC5hc3luY0xvYWRpbmcodHJ1ZSlcbiAgICAgIC5zY3JpcHRVcmwoJy92ZW5kb3IvbW9tZW50Lm1pbi5qcycpO1xuICB9XSk7XG5cbiJdfQ==
;