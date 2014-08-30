angular.module('app')

    .controller("authCtrl", ['$scope', '$window', '$rootScope', '$http', 'trademarkService', 'pathService', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'menuModal','dropdownMenu', 'loginModal', 'uploadImageModal', 'userService',
        function($scope, $window, $rootScope, $http, trademarkService, pathService, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, menuModal, dropdownMenu, loginModal, uploadImageModal, userService){
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
                $rootScope.modal = true;
                loginModal.activate();

            });
            
            $.loadingView = false;
            
            $.$on('$routeChangeStart', function() {
              $scope.loadingView = true;
            });
            
            $.$on('$routeChangeSuccess', function() {
              $scope.loadingView = false;
            });
            
             $.toggleDropdownMenu = function(){
                    if (!$rootScope.dropdownMenu){
                        $rootScope.dropdownMenu = true;
                        dropdownMenu.activate({ user: $rootScope.user});
                    }
                    else {
                        $rootScope.dropdownMenu = false;
                        dropdownMenu.deactivate(); 
                    }

                };
            
            $.removeModalOverlay = function(){
                $rootScope.modal = false;
                trademarkModal.deactivate();
                editTrademarkModal.deactivate();
                editCountryModal.deactivate();
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
            }
            
            $.login = function(){
                loginModal.activate();
                $rootScope.modal = true;
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
    
    .controller("loginCtrl", ['$scope', '$window', '$rootScope', 'userService', 'pathService', '$location', 'trademarkService',
        function($scope, $window, $rootScope, userService, pathService, $location, trademarkService){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$dirty && $.loginForm.$valid;
            }
            
            $.login = function(){

                userService.logIn({ password: $.password, email: $.email })
                
                    .then(function(res){
                        $window.sessionStorage.token = res.token;
                        $rootScope.user = true;
                        if (pathService.returnPath() === undefined){
                            $location.path('/select-portfolio');
                        }
                        else {
                            $location.path(pathService.returnPath());
                        }
                    }, 
                    function(err){
                        $.message = err.message;
                    });
                }
        }]);
