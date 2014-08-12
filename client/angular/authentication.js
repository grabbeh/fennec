angular.module('app')

    .controller("authCtrl", ['$scope', '$rootScope', '$http', 'trademarkReviser', 'pathHolder', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'menuModal','uploadImageModal', 'userGetter',
        function($scope, $rootScope, $http, trademarkReviser, pathHolder, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, menuModal, uploadImageModal, userGetter){
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
            
            $.removeModalOverlay = function(){
                $rootScope.modal = false;
                $rootScope.menuModal = false;
                menuModal.deactivate();
                trademarkModal.deactivate();
                editTrademarkModal.deactivate();
                editCountryModal.deactivate();
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
            }
            
            $.logout = function(){
                $http.get('/api/logout')
                    .success(function(){
                        $rootScope.user = false;
                        $location.path('/');
                    })
            }
            
            userGetter.getUser().then(function(data){
                $rootScope.user = data;
            });
        
            $.isUser = function(){
                return !!$rootScope.user;
            }

        }])
    
    .controller("loginCtrl", ['$scope', '$rootScope', 'userGetter', 'pathHolder', '$http', '$location', 'trademarkReviser',
        function($scope, $rootScope, userGetter, pathHolder, $http, $location, trademarkReviser){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$dirty && $.loginForm.$valid;
            }
            
            $.login = function(){
                $http.post('/api/login', { password: $.password, username: $.username })
                    .success(function(){
                        userGetter.getUser().then(function(response){
                            $rootScope.user = response;
                        });
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
