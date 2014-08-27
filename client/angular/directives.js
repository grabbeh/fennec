angular.module('app')

    .directive('mgMenuMover', function(){
        return {
        scope: {
            menuModal: '='
        },
        link: function(scope, element, attrs){
            scope.$watch(attrs.menuModal, function(v){
                if (v){
                    element.addClass('active-menu')
                }
                else {
                    element.removeClass('active-menu')
                }
            })
        }
    }
    })
    
    .directive('mgTrademarkContainer', function(){
        return {
        scope: {
            trademark: '=',
            user: '=',
            editTrademark: '&',
            deleteTrademark: '&'
        },
        replace: true,
        templateUrl: '/partials/trademark-container.html',
        controller: function($scope){
        	var $ = $scope;
            $.editTrademarkWrapper = function(trademark){
                    var func = $scope.editTrademark();
                    func(tm);
            }
            $.deleteTrademarkWrapper = function(trademark){
                	var func = $scope.deleteTrademark();
                	func(trademark);
                }
        }
      }
    })

    .directive('mgFavouriteButton', function(){
        return {
	        replace: true,
	        templateUrl: '/partials/favourite-button.html',
	        scope: {
	                trademark: '=',
	           		user: '='
	        },
	        controller: function($scope, userService){
	            var $ = $scope;
	            $.toggleFavourite = function(){
		          	if ($.trademark.favourite){
		              	$.trademark.favourite = false;
		              	$.user.favourites.forEach(function(fav, i){
		              	  	if (fav === $.trademark._id){
		              	     	$.user.favourites.splice(i, 1);
		              	  		}
		              		})
		              		userService.updateUser($.user).then(function(res){
                                
		            		 });
		
		            }
		        	else {
		              $.trademark.favourite = true;
		              $.user.favourites.push($.trademark._id)
		              userService.updateUser($.user).then(function(res){
                          
		              })
		            }
	             }
			}
   		}  
    })

     .directive('mgRegisteredTrademarkList', function(){
        return {
          replace: true,
          templateUrl: '/partials/registered-list.html',
          scope: {
              registered: '=',
              showModal: '&'
          },
          controller: function($scope){
               var $ = $scope;
               $.showModalWrapper = function(tm){
                    var func = $scope.showModal();
                    func(tm);
                }
          }
       }
    })

    .directive('mgPublishedTrademarkList', function(){
        return {
          replace: true,
          templateUrl: '/partials/published-list.html',
          scope: {
              published: '=',
              showModal: '&'
          },
          controller: function($scope){
               var $ = $scope;
               $.showModalWrapper = function(tm){
                    var func = $scope.showModal();
                    func(tm);
                }
          }
       }
    })

    .directive('mgPendingTrademarkList', function(){
        return {
          replace: true,
          templateUrl: '/partials/pending-list.html',
          scope: {
              pending: '=',
              showModal: '&'
          },
          controller: function($scope){
               var $ = $scope;
               $.showModalWrapper = function(tm){
                    var func = $scope.showModal();
                    func(tm);
                }
          }
       }
    })

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
                if ($rootScope.l){ map.removeLayer($rootScope.l);  }
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

    .directive('mgAdminAlertWidget', function(userService) {
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
                     userService.updateUser(user)
                        .then(function(data){
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

.directive('mgFavouritesPaginator', function() {
      return {
            templateUrl: "/partials/admin-favourites.html",
            replace: true, 
            link: function(scope, elements, attrs){
                var $ = scope;
                 $.$watch('favouriteMarks', function(newVal){
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
                favouriteMarks: '=',
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

  

