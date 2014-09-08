
app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: '/partials/landing-page.html',
            controller: 'landingPageCtrl'
        }).
        when('/terms', {
            templateUrl: '/partials/terms-of-use.html'
        }).
        when('/quick-search/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/quick-search.html',
            controller: 'quickSearchCtrl',
            resolve: {
                user: function(userService){
                    return userService.isUser();
                }
            }
        }).
        when('/favourites/:portfolio', {
           templateUrl: '/partials/favourites.html',
           controller: 'favouritesCtrl',
           resolve: {
               isUser: function(userService){
                   return userService.isUser();
               },
               favourites: function($route, trademarkService){
                   return trademarkService.favourites($route.current.params.portfolio);
               }, 
               user: function(userService){
                   return userService.getUser();
               }
           }
        }).
        when('/home/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/portfolio-home.html',
            controller: 'portfolioHomeCtrl',
            resolve: {
                isUser: function(userService){
                    return userService.isUser();
                },
                user: function(userService){
                    return userService.getUser();
                },
                countries: function(geoJsonService, $route){
                    return geoJsonService.countryData($route.current.params.portfolio);
                },
                marks: function(trademarkService, $route){
                    return trademarkService.getListOfMarks($route.current.params.portfolio);
                }
            }
            
        }).
        when('/map/:portfolio', {
            templateUrl: '/partials/map.html',
            controller: 'mapCtrl',
            resolve: {
                isUser: function(userService){
                    return userService.isUser();
                },
                countryData: function(geoJsonService){
                    return geoJsonService.countryData();
                },
                user: function(userService){
                  return userService.getUser();  
                },
                world: function($route, geoJsonService){
                    return geoJsonService.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                trademarks: function($route, trademarkService){
                    return trademarkService.getGroup($route.current.params.portfolio, "ALL MARKS");
                }
            }
        }).
        when('/login', {
            templateUrl: '/partials/login.html',
            controller: 'loginCtrl'
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
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
        when('/upload', {
            templateUrl: '/partials/upload.html',
            controller: 'uploadCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }). 
    	when('/add/trademark/:portfolio', {
            templateUrl: '/partials/add.html',
            controller: 'addCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
   		when('/view/trademark/:id', {
            templateUrl: '/partials/view-trademark.html',
            controller: 'trademarkViewCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                },
                user: function(userService){
                   return userService.getUser();
               },
               trademark: function($route, trademarkService){
                   return trademarkService.getTrademark($route.current.params.id);
               }
            }
        }).
        when('/admin/group/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/view-group.html',
            controller: 'groupViewCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                },
                user: function(userService){
                    return userService.getUser();
                }
            }
        }).
        when('/admin/country/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/view-country.html',
            controller: 'countryViewCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                },
                user: function(userService){
                    return userService.getUser();
                }
            }
        }).
    	when('/admin/expiring/:portfolio/:year', {
            templateUrl: '/partials/expiry-map.html',
            controller: 'expiryCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
        when('/admin/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/admin.html',
            controller: 'adminCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                },
                activities: function($route, activityService){
                    return activityService.activities($route.current.params.portfolio);
                },
                user: function(userService){
                    return userService.getUser();
                },
                trademarks: function($route, trademarkService){
                    return trademarkService.getGroup($route.current.params.portfolio, "ALL MARKS");
                },
                world: function($route, geoJsonService){
                    return geoJsonService.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                countries: function($route, geoJsonService){
                    return geoJsonService.countryData($route.current.params.portfolio);
                },
                barChartData: function($route, chartService){
                    return chartService.barChartDataForGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartOptions: function(chartService){
                    return chartService.barChartOptions();
                }
            }
        }).
        when('/create-account', {
            templateUrl: '/partials/create-account.html', 
            controller: 'createAccountCtrl'
            }
        ).
        when('/home', {
            templateUrl:'/partials/home.html',
            controller: 'selectPortfolioCtrl',
            resolve:{
                isUser: function(userService){
                    return userService.isUser();
                },
                user: function(userService){
                    return userService.getUser();
                },
                notifications: function(notificationService){
                    return notificationService.allNotifications();
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

app.run(function() {
    FastClick.attach(document.body);
  });
