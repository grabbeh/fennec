angular.module('app')

    .controller("authCtrl", ['$scope', '$window', '$rootScope', '$http', 'trademarkService', 'pathService', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'menuModal','uploadImageModal', 'userService',
        function($scope, $window, $rootScope, $http, trademarkService, pathService, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, menuModal, uploadImageModal, userService){
            var $ = $scope;
            $rootScope.menuModal = false;
            $rootScope.$on('$routeChangeError', function(event, previous){
                var originalPath = previous.$$route.originalPath;
                if (previous.params){
                    for (var key in previous.params){
                         originalPath = originalPath.replace(":" + key, previous.params[key]);
                    }
                }
                pathService.insertPath(originalPath);
                $location.path('/login');

            });
            
            $.loadingView = false;
            
            $.$on('$routeChangeStart', function() {
              $scope.loadingView = true;
            });
            
            $.$on('$routeChangeSuccess', function() {
              $scope.loadingView = false;
            });
            
            $.removeMenu = function(){
                $rootScope.menuModal = false;
                menuModal.deactivate();
            }
            
            $.removeModalOverlay = function(){
                $rootScope.modal = false;
               
                trademarkModal.deactivate();
                editTrademarkModal.deactivate();
                editCountryModal.deactivate();
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
            }
            
            $.logout = function(){
                $rootScope.menuModal = false;
                menuModal.deactivate();
                delete $window.sessionStorage.token;
                $rootScope.user = false;
                $location.path('/');
            }
            
            userService.getUser().then(function(data){
                $rootScope.user = data;
            });
        
            $.isUser = function(){
                return !!$rootScope.user;
            }

        }])
    
    .controller("loginCtrl", ['$scope', '$window', '$rootScope', 'userService', 'pathService', '$http', '$location', 'trademarkService',
        function($scope, $window, $rootScope, userService, pathService, $http, $location, trademarkService){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$dirty && $.loginForm.$valid;
            }
            
            $.login = function(){
                $http.post('/server/login', { password: $.password, username: $.username })
                    .success(function(res){
                        $window.sessionStorage.token = res.token;
                        $rootScope.user = true;
                        if (pathService.returnPath() === undefined){
                            $location.path('/select-portfolio');
                        }
                        else {
                            $location.path(pathService.returnPath());
                        }
                    })
                    .error(function(err){
                        $.message = err.message;
                    });
                }
        }]);
