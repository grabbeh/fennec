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
                        //$rootScope.user = true;
                        loginModal.deactivate();
                        userService.getUser().then(function(data){

                               $rootScope.user = data;
                           });
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
