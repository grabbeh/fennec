
app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: '/partials/landing-page.html',
            controller: 'landingPageCtrl'
        }).
        when('/simple-search/:portfolio', {
            templateUrl: '/partials/quick-search.html',
            controller: 'quickSearchCtrl'
            resolve: {
                user: function(userGetter){
                    return userGetter.isUser();
                }
            }
        }).
        when('/home/:portfolio', {
            templateUrl: '/partials/portfolio-home.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.isUser();
                }
            }
            
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
        when('/admin/group/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/partials/view-group.html',
            controller: 'groupViewCtrl',
            resolve: {
                admin: function(userGetter){
                    return userGetter.isAdmin();
                }
            }
        }).
        when('/admin/country/:portfolio', {
            reloadOnSearch: false,
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
            reloadOnSearch: false,
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

