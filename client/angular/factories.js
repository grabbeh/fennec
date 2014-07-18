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

