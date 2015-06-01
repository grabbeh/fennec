angular.module('app')
    .controller("authCtrl", ['$scope', 'notificationModal','loginModal','$window', '$rootScope', 'trademarkService', 'pathService', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'menuModal','dropdownMenu', 'uploadImageModal', 'userService',
        function($scope, notificationModal, loginModal, $window, $rootScope, trademarkService, pathService, $location, trademarkModal, editTrademarkModal, editGroupModal, menuModal, dropdownMenu, uploadImageModal, userService){
            var $ = $scope;
            $rootScope.dropdownMenu = false;
            
            $rootScope.$on('$routeChangeStart', function(ev, att, prev, err){
                console.log("rootScope on route change" + " " + $rootScope.user);
            })
            $rootScope.$on('$routeChangeError', function(event, attempted, previous, error){
                console.log(error);
                console.log("Error in route change");
                var attemptedPath = attempted.$$route.originalPath;
                if (attempted.params){
                    for (var key in attempted.params){
                         attemptedPath = attemptedPath.replace(":" + key, attempted.params[key]);
                    }
                }
                pathService.insertPath(attemptedPath);

                if (previous){
                    var previousPath = previous.$$route.originalPath;
                    if (previous.params){
                        for (var key in previous.params){
                             previousPath = previousPath.replace(":" + key, previous.params[key]);
                        }
                    }

                    notificationModal.activate({ error: error.data.message});
                    $location.path(previousPath);
                }
                
                else {
                    $location.path('/login');
                }
            });
            
            $.loadingView = false;
            
            $.$on('$routeChangeStart', function() {
              $scope.loadingView = true;
            });
            
            $.$on('$routeChangeSuccess', function() {
              $scope.loadingView = false;
            });

            $.$on('modal.activate', function(){
                $rootScope.modal = true;
            });
            
            $.$on('modal.deactivate', function(){
                $rootScope.modal = false;
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
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
                loginModal.deactivate();
            };
            
            $.login = function(){
                loginModal.activate({}, { broadcast: true });
            };
            
            $.logout = function(){
                pathService.clearPath();
                $rootScope.menuModal = false;
                menuModal.deactivate();
                delete $window.sessionStorage.token;
                $rootScope.user = false;
                $location.path('/');
            };
            
            userService.getUser().then(function(data){
                console.log(data);
                console.log("User data")
                $rootScope.user = data;
            });
        
            $.isUser = function(){
                return !!$rootScope.user;
            };

        }])
    
