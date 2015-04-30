angular.module('app')

	.controller('dropdownMenuCtrl', ['$scope', 'pathService', '$window', '$location', '$rootScope', '$routeParams','dropdownMenu', 'loginModal', 
    function($scope, pathService, $window, $location, $rootScope, $routeParams, dropdownMenu, loginModal){
	        var $ = $scope;
	        
	        $.closeMenu = function(){
	            dropdownMenu.deactivate();
                $rootScope.dropdownMenu = false;
	        }

            $.login = function(){
            	dropdownMenu.deactivate();
                $rootScope.dropdownMenu = false;
                loginModal.activate();
                $rootScope.modal = true;
            }
  
	        $.logout = function(){
              pathService.clearPath();
	            $rootScope.user = false;
	            delete $window.sessionStorage.token;
	            dropdownMenu.deactivate();
	            $rootScope.dropdownMenu = false;
	            $location.path('/');
	        }
         }])
