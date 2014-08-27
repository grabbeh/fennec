
app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: '/partials/landing-page.html',
            controller: 'landingPageCtrl'
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
               user: function(userService){
                   return userService.isUser();
               },
               favourites: function(trademarkService){
                   return trademarkService.favourites();
               }
           }
        }).
        when('/home/:portfolio', {
            templateUrl: '/partials/portfolio-home.html',
            controller: 'portfolioHomeCtrl',
            resolve: {
                user: function(userService){
                    return userService.isUser();
                }
            }
            
        }).
    	when('/demo/:portfolio', {
            templateUrl: '/partials/admin.html',
            controller: 'adminCtrl',
            resolve: {
                user: function(userService){
                    return userService.getUser();
                },
                trademarks: function($route, trademarkService){
                    return trademarkService.getGroup($route.current.params.portfolio, "ALL MARKS");
                },
                world: function($route, geoJsonService){
                    return geoJsonService.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartData: function($route, chartService){
                    return chartService.barChartDataForGroup($route.current.params.portfolio, "ALL MARKS");
                },
                barChartOptions: function(chartService){
                    return chartService.barChartOptions();
                }
            }
        }).
        when('/map/:portfolio', {
            templateUrl: '/partials/map.html',
            controller: 'mapCtrl',
            resolve: {
                user: function(userService){
                    return userService.isUser();
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
    	when('/admin/trademark/:portfolio', {
            templateUrl: '/partials/add.html',
            controller: 'addCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
   		when('/admin/trademark/:id', {
            templateUrl: '/partials/view-trademark.html',
            controller: 'trademarkViewCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
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
                user: function(userService){
                    return userService.getUser();
                },
                trademarks: function($route, trademarkService){
                    return trademarkService.getGroup($route.current.params.portfolio, "ALL MARKS");
                },
                world: function($route, geoJsonService){
                    return geoJsonService.getWorldGroup($route.current.params.portfolio, "ALL MARKS");
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
        when('/select-portfolio', {
            templateUrl:'/partials/select-portfolio.html',
            controller: 'selectPortfolioCtrl',
            resolve:{
                admin: function(userService){
                    return userService.isAdmin();
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

