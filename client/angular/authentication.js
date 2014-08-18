angular.module('app')

    .controller("authCtrl", ['$scope', '$window', '$rootScope', '$http', 'trademarkReviser', 'pathHolder', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'menuModal','uploadImageModal', 'userGetter',
        function($scope, $window, $rootScope, $http, trademarkReviser, pathHolder, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, menuModal, uploadImageModal, userGetter){
            var $ = $scope;
            $rootScope.menuModal = false;
            $rootScope.$on('$routeChangeError', function(event, previous){
                var originalPath = previous.$$route.originalPath;
                if (previous.params.id){
                    originalPath = originalPath.replace(":id", previous.params.id);
                }
                pathHolder.insertPath(originalPath);

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
            
            userGetter.getUser().then(function(data){
                console.log(data);
                $rootScope.user = data;
            });
        
            $.isUser = function(){
                return !!$rootScope.user;
            }

        }])
    
    .controller("loginCtrl", ['$scope', '$window', '$rootScope', 'userGetter', 'pathHolder', '$http', '$location', 'trademarkReviser',
        function($scope, $window, $rootScope, userGetter, pathHolder, $http, $location, trademarkReviser){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$dirty && $.loginForm.$valid;
            }
            
            $.login = function(){
                $http.post('/auth/login', { password: $.password, username: $.username })
                    .success(function(res){
                        $window.sessionStorage.token = res.token;
                        $rootScope.user = true;
                        if (pathHolder.existingPath){
                             $location.path(pathHolder.returnPath());
                        }
                        $location.path('/select-portfolio');
                       
                    })
                    .error(function(err){
                        $.message = err.message;
                    });
                }
        }]);
