
app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: '/views/landing-page/landing-page.html',
            controller: 'landingPageCtrl'
        }).
        when('/terms', {
            templateUrl: '/views/terms/terms.html'
        }).
        when('/api', {
           templateUrl:'/views/api/api.html',
           resolve: {
                user: function(userService){
                    return userService.getUser();
                }
            }
        }).
        when('/invite/:id', {
            templateUrl: '/views/accept-invite/accept-invite.html',
            controller: 'acceptInviteCtrl',
            resolve: {
                invite: function(userService, $route){
                    return userService.getInvite($route.current.params.invite)
                }
            }
        }).
        when('/settings', {
            templateUrl: '/views/settings/settings.html',
            controller: 'settingsCtrl', 
            resolve: {
                user: function(userService){
                    return userService.getUser();
                }
            }
        }).
        when('/about', {
            templateUrl: '/views/about/about.html'
        }).
        when('/users', {
            templateUrl: '/views/users/users.html',
            controller: 'usersCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                },
                user: function(userService){
                    return userService.getUser();
                },
                users: function(userService){
                    return userService.allUsers();
                }
            }
        }).
        when('/quick-search/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/views/quick-search/quick-search.html',
            controller: 'quickSearchCtrl',
            resolve: {
                user: function(userService){
                    return userService.isUser();
                }
            }
        }).
        when('/favourites/:portfolio', {
           templateUrl: '/views/favourites/favourites.html',
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
            templateUrl: '/views/portfolio-home/portfolio-home.html',
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
            templateUrl: '/views/map/map.html',
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
                    return geoJsonService.getWorldGroup($route.current.params.portfolio);
                },
                trademarks: function($route, trademarkService){
                    return trademarkService.getGroup($route.current.params.portfolio);
                }
            }
        }).
        when('/login', {
            templateUrl: '/views/login/login.html',
            controller: 'loginCtrl'
        }).
        when('/reset-password', {
            templateUrl: '/views/password-reset-request/password-reset-request.html',
            controller: 'passwordResetCtrl'
        }).
        when('/password/:id', {
            templateUrl: '/views/change-password/change-password.html',
            controller: 'passwordCtrl'
        }).
        when('/upload', {
            templateUrl: '/views/upload/upload.html',
            controller: 'uploadCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }). 
    	when('/add/trademark/:portfolio', {
            templateUrl: '/views/add-trademark/add-trademark.html',
            controller: 'addTrademarkCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
   		when('/view/trademark/:id', {
            templateUrl: '/views/view-trademark/view-trademark.html',
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
            templateUrl: '/views/view-group/view-group.html',
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
            templateUrl: '/views/view-country/view-country.html',
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
            templateUrl: '/views/expiry-map/expiry-map.html',
            controller: 'expiryCtrl',
            resolve: {
                admin: function(userService){
                    return userService.isAdmin();
                }
            }
        }).
        when('/dashboard/:portfolio', {
            reloadOnSearch: false,
            templateUrl: '/views/admin/admin.html',
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
                    return trademarkService.getGroup($route.current.params.portfolio);
                },
                world: function($route, geoJsonService){
                    return geoJsonService.getWorldGroup($route.current.params.portfolio);
                },
                countries: function($route, geoJsonService){
                    return geoJsonService.countryData($route.current.params.portfolio);
                },
                barChartData: function($route, chartService){
                    return chartService.barChartData($route.current.params.portfolio);
                },
                barChartOptions: function(chartService){
                    return chartService.barChartOptions();
                }
            }
        }).
        when('/create-account', {
            templateUrl: '/views/create-account/create-account.html', 
            controller: 'createAccountCtrl'
            }
        ).
        when('/home', {
            templateUrl:'/views/home/home.html',
            controller: 'homeCtrl',
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
