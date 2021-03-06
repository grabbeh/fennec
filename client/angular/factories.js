    angular.module('app')

    .factory('notificationModal', ['btfModal', function(btfModal){
    return btfModal({
      controller: 'notificationModalCtrl',
      templateUrl: '/modals/notification-modal/notification-modal.html'
    })
    }])

    .factory('loginModal', ['btfModal', function(btfModal){
    	return btfModal({
    		controller: 'loginModalCtrl', 
    		templateUrl: '/modals/login-modal/login-modal.html'
    	})
    }])

    .factory('dropdownMenu', ['btfModal', function(btfModal){
    	return btfModal({
          controller: 'dropdownMenuCtrl',
          templateUrl: '/modals/dropdown-menu/dropdown-menu.html'
        });	
    }])
    .factory('menuModal', ['btfModal', function(btfModal){
      return btfModal({
      controller: 'menuModalCtrl',
      templateUrl: '/modals/menu-modal/menu-modal.html'
    });
      
    }])
    .factory('trademarkModal', ['btfModal', function (btfModal) {
        return btfModal({
          controller: 'trademarkModalCtrl',
          templateUrl: '/modals/trademark-modal/trademark-modal.html'
        });
    }])

    .factory('editTrademarkModal', ['btfModal', function (btfModal) {
        return btfModal({
          controller: 'editTrademarkModalCtrl',
          templateUrl: '/modals/edit-trademark-modal/edit-trademark-modal.html'
        });
    }])

    .factory('editGroupModal', ['btfModal', function (btfModal) {
        return btfModal({
          controller: 'editGroupCtrl',
          templateUrl: '/modals/edit-group-modal/edit-group-modal.html'
        });
    }])

    .factory('uploadImageModal', ['btfModal', function(btfModal){
        return btfModal({     
            controller: 'uploadImageCtrl',
            templateUrl: '/modals/upload-image-modal/upload-image-modal.html'
        });
    }])

    .factory('activityService', ['$http', function($http){
        var activityService = {
            activities: function(portfolio){
                return $http.get('/api/activities/' + portfolio)
                    .then(function(response){
                        return response.data;
                    });
            }
        }
        return activityService;
    }])

    .factory('notificationService', ['$http', function($http){
        var notificationService = {
            allNotifications: function(){
                return $http.get('/api/notifications')
                    .then(function(response){
                        return response.data;
                    });
            },
            updateNotification: function(notification){
                return $http.post('/api/notifications', notification)
                    .then(function(res){
                        return res;
                    });
                }
            }
        return notificationService;
    }])

    .factory('userService', ['$http', function ($http) {
    var user = [];
    var userService = {
        logIn: function(user){
            return $http.post('/server/login', user)
            	.then(function(res){
                 	return res;
                }, function(res){
    				return res;
                })
        },
        isUser: function(){
            return $http.get('/api/isUser');
        },
        isAdmin: function(){
            return $http.get('/api/isAdmin');
        },
        getUser: function(){
            return $http.get('/api/user').then(function(response){
                return response.data;
            });
        },
        updateUser: function(user){
            return $http.put('/api/users/' + user._id, user).then(function(response){
            	return response.data;
            })
        },
        deleteUser: function(id){
            return $http.delete('/api/users/' + id).then(function(response){
                return response.data;
            })
        },
        allUsers: function(){
            return $http.get('/api/users')
                .then(function(response){
                    return response.data;
                })
        },
        sendInvite: function(user){
            return $http.post('/api/sendInvite', user)
                .then(function(res){
                    return res.data;
                }, function(res){
                    return res.data;
                })
        },
        getInvite: function(invite){
            return $http.get('/server/getInvite' + invite)
                .then(function(res){
                    return res.data;
                }, function(res){
                    return res.data;
                })
        },
        acceptInvite: function(user, invite){
            return $http.post('/server/invite/' + invite, user)
                .then(function(res){
                    return res.data;
                }, function(res){
                    return res.data;
                })
        }
    }
    return userService;
    }])

    .factory('geoJsonService', ['$http', function($http){
    var geoJsonService = {
        getWorldGroup: function(portfolio, group, country){
            if (group === "ALL MARKS" || !group)
                var url = '/api/world/' + portfolio;   
            else 
                var url = '/api/world/' + portfolio + '?group=' + group;
            if (country){
                var url = '/api/world/' + portfolio + '?country=' + country;
            }
            return $http.get(url)
            	.then(function(response){
                    return response.data;
            })
        },
        getExpiriesForYear: function(portfolio, year){
            return $http.get('/api/expiriesForYear/' + portfolio + '?year=' + year)
        },
        countryData: function(portfolio){
            var url = '/api/countryData';
            if (portfolio)
                var url = '/api/countryData?portfolio=' + portfolio;
              
            return $http.get(url)
                .then(function(response){
                    return response.data;
        		})
        }
    }
    return geoJsonService;
    }])

    .factory('trademarkService', ['$http', '$rootScope', function($http, $rootScope){
    function curry(fun){
        return function(arg){
            return fun(arg);
        }   
      }

    var trademarkService = {
      	getListOfMarks: function(portfolio, country){
      	       var url = '/api/list/' + portfolio;
      	       if (country)
      	       	   var url = url + '?country=' + country;
      	       return $http.get(url)
                .then(function(response){
                     return response.data;
          	})
     	},
        getGroup: function(portfolio, group){
            if (group === "ALL MARKS" || !group){
                var url = '/api/trademarks/' + portfolio;
            }
            else
                var url = '/api/trademarks/' + portfolio + '?group=' + group;
            return $http.get(url)
                .then(function(response){
                    return response.data;
            });
        },
        getCountry: function(portfolio, country){
              return $http.get('/api/country/' + portfolio + '/' + country)
              	.then(function(response){
                    return response.data;
    	        })
          },
        favourites: function(portfolio){
           	return $http.get('/api/favourites/' + portfolio)
           	    .then(function(response){
           	    	return response.data;
           	    })
          },
        editGroup: function(portfolio, mark, trademark){
              return $http.post('/api/editGroup/' + portfolio + '/' + mark, { trademark: trademark })
          },
        getExpiryDatesForGroup: function(portfolio, group, country){
            if (group === "ALL MARKS" || !group)
                var url = '/api/expirydates/' + portfolio;
            else
                var url = '/api/expirydates/' + portfolio + '?group=' + group;
            if (country){
                var url = url + '/' + country;
            }
            return $http.get(url)
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
        addMark: function(trademark, portfolio){
            if (typeof trademark.classes === 'string')
                trademark.classes = _.map(trademark.classes.split(","), curry(parseInt));
            trademark.portfolio = portfolio;
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
        return trademarkService;
    }])

    .factory('pathService', [function(){
      
      var path = [];
      var pathService = {
           insertPath: function(url){
                if (url != "/login"){ path[0] = url; };
           },
           returnPath: function(){
                return path[0];
           },
           clearPath: function(){
               path[0] = undefined;
           },
           existingPath: function(){
                if (path.length > 0){
                     return true;
                }
           }

      }
      return pathService;
    }])

    .factory('chartService', ['$filter', '$http', 'trademarkService', function($filter, $http, trademarkService){
        var chartService = {
            barChartData: function(portfolio, group, country){
                return trademarkService.getExpiryDatesForGroup(portfolio, group, country)
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
                        animationSteps : 120,
                        responsive: true
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
                        animationSteps : 200,
                        responsive: true
                    };
               }
        }
        return chartService;
    }])

