angular.module('app')

     .controller('loginModalCtrl', ['$scope', 'notificationModal', '$window', 'pathService', 'userService', '$location',  '$rootScope', '$routeParams','loginModal', 
        function($scope, notificationModal, $window, pathService, userService, $location, $rootScope, $routeParams, loginModal){
        var $ = $scope;
        
        $.closeModal = function(){
            loginModal.deactivate();
            $rootScope.modal = false;
        }
        
       // $.canSubmitLogin = function(){
         //    return $.loginForm.$valid;
       // }

        $.login = function(){

            userService.logIn({ password: $.password, email: $.email })
                .then(function(res){
                    if (res.status === 401){
                        notificationModal.activate({error: res.data.message})
                    }
                    else {
                        $window.sessionStorage.token = res.data.token;
                        $rootScope.user = true;
                        $rootScope.modal = false;
                        loginModal.deactivate();
                        if (pathService.returnPath() === undefined){
                            $location.path('/home');
                        }
                        else {
                            $location.path(pathService.returnPath());
                        }


                    } 
                })
            }
     }])
