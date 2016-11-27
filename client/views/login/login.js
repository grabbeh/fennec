angular.module('app')

    .controller("loginCtrl", ['$scope', '$window', '$rootScope', 'userService', 'pathService', '$location',
        function($scope, $window, $rootScope, userService, pathService, $location){
            var $ = $scope;
            
            $.canSubmitLogin = function(){
                return $.loginForm.$valid;
            };
            
            $.login = function(){
                userService.logIn({ password: $.password, email: $.email })
                    .then(function(res){
                        $window.sessionStorage.token = res.data.token;
                        $rootScope.isUser = true;
                        if (pathService.returnPath() === undefined){
                            $location.path('/home');
                        }
                        else {
                            $location.path(pathService.returnPath());
                        }
                    }, 
                    function(err){
                        $.message = err.message;
                    });
                };
        }]);
