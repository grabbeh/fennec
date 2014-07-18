angular.module('app')

    .controller("authCtrl", ['$scope', '$rootScope', '$http', 'trademarkReviser', 'pathHolder', '$location', 'trademarkModal', 'editTrademarkModal', 'editGroupModal', 'editCountryModal', 'uploadImageModal', 'userGetter',
        function($scope, $rootScope, $http, trademarkReviser, pathHolder, $location, trademarkModal, editTrademarkModal, editGroupModal, editCountryModal, uploadImageModal, userGetter){
            var $ = $scope;
            $rootScope.$on('$routeChangeError', function(event, previous){
                var originalPath = previous.$$route.originalPath;
                if (previous.params.id){
                    originalPath = originalPath.replace(":id", previous.params.id);
                }
                pathHolder.insertPath(originalPath);
                
                userGetter.anyUsers().then(function(){
                    $location.path('/login');
                }, function(err){
                     $location.path('/create-account');
                });
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
                trademarkModal.deactivate();
                editTrademarkModal.deactivate();
                editCountryModal.deactivate();
                editGroupModal.deactivate();
                uploadImageModal.deactivate();
            }
            
            $.logout = function(){
                $http.get('/api/logout')
                    .success(function(){
                        userGetter.removeClientUser();
                        $.user = false;
                        $location.path('/');
                    })
            }
            
            userGetter.getUser().then(function(data){
                console.log(data);
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
                            userGetter.storeUser(response);
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
