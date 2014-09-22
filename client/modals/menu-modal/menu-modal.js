angular.module('app')

	.controller('menuModalCtrl', ['$scope', '$window', '$location',  '$rootScope', '$routeParams','$window', 'menuModal', 
        function($scope, $window, $location, $rootScope, $routeParams, $window, menuModal){
        var $ = $scope;
        
        $.closeModal = function(){
            menuModal.deactivate();
            $rootScope.modal = false;
            $rootScope.menuModal = false;
        }
        
        $.getJSON = function(){
               var token = $window.sessionStorage.token;
               $window.open('/download/downloadTrademarks?portfolio=' + $routeParams.portfolio + '&token=' + token)
         };
            
        $.logout = function(){
               
            $rootScope.user = false;
            delete $window.sessionStorage.token;
            $rootScope.menuModal = false;
            $location.path('/');
        }
      
    }])