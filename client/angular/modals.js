angular.module('app')

        .controller('notificationModalCtrl', ['$scope', 'notificationModal', function($scope, notificationModal){
            var $ = $scope;
            $.closeModal = function(){
                notificationModal.deactivate();
            }

        }])

         .controller('loginModalCtrl', ['$scope', 'notificationModal', '$window', 'pathService', 'userService', '$location',  '$rootScope', '$routeParams','loginModal', 
            function($scope, notificationModal, $window, pathService, userService, $location, $rootScope, $routeParams, loginModal){
	        var $ = $scope;
	        
	        $.closeModal = function(){
	            loginModal.deactivate();
	            $rootScope.modal = false;
	        }
	        
	        $.canSubmitLogin = function(){
	             return $.loginForm.$dirty && $.loginForm.$valid;
	        }

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
	
	.controller('dropdownMenuCtrl', ['$scope', 'pathService', '$window', '$location', '$rootScope', '$routeParams','dropdownMenu', 'loginModal', 
    function($scope, pathService, $window, $location, $rootScope, $routeParams, dropdownMenu, loginModal){
	        var $ = $scope;
	        
	        $.closeMenu = function(){
	            dropdownMenu.deactivate();
                $rootScope.dropdownMenu = false;
	        }

            $.login = function(){
                loginModal.activate();
                $rootScope.modal = true;
            }
  
	        $.logout = function(){
              pathService.clearPath();
	            $rootScope.user = false;
	            delete $window.sessionStorage.token;
	            $rootScope.dropdownMenu = false;
	            $location.path('/');
	        }
         }])
	
	
	
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
    
    .controller('trademarkModalCtrl', ['$scope', 'notificationModal', '$rootScope', 'userService', 'trademarkService', '$http', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, notificationModal, $rootScope, userService, trademarkService, $http, editTrademarkModal, trademarkModal) {
      var $ = $scope;
      $.alpha2 = $.trademark.country.alpha2.toLowerCase();
      
      $.closeModal = function() {
        trademarkModal.deactivate();
        $rootScope.modal = false;
      };
          
      $.openEditTrademarkModal = function(trademark){
        userService.isAdmin().then(function(){
                trademarkModal.deactivate();
                editTrademarkModal.activate({trademark: trademark})
            }, function(res){
                notificationModal.activate({ error: res.data.message});
            })
          }
    
      $.deleteTrademark = function(trademark){
        userService.isAdmin().then(function(res){
            trademarkService.deleteMark(trademark)
               .success(function(data){
                    notificationModal.activate({ success: data.message })
               })
            }, function(res){
                notificationModal.activate({error: res.data.message });
            })
        }
    }])
  
    
    .controller('editTrademarkModalCtrl', ['$scope', 'notificationModal', '$rootScope', '$http', 'trademarkService', 'editTrademarkModal',
      function ($scope, notificationModal, $rootScope, $http, trademarkService, editTrademarkModal) {
          var $ = $scope;
          $.closeModal = function() {
            editTrademarkModal.deactivate();
            $rootScope.modal = false;
          };
    
          $.statuses = ["Registered", "Published", "Pending"];

        $http.get('/api/countryData')
            .success(function(data){
                $.countrydata = data;
            })
    
        $.editTrademark = function(trademark){
            trademarkService.editMark(trademark)
                .success(function(data){
                    notificationModal.activate({ success: data.message })
                });
            }
       
    }])

	.controller('editGroupCtrl', ['$scope', '$rootScope', '$routeParams', '$http', 'trademarkService', 'editGroupModal',
         function($scope, $rootScope, $routeParams, $http, trademarkService, editGroupModal){
              var $ = $scope;
              $.closeModal = function() {
                    editGroupModal.deactivate();
                    $rootScope.modal = false;
              };
             
              $.editGroup = function(trademark){
                  trademarkService.editGroup($.portfolio, $.mark, trademark)
                      .success(function(data){
                          $.message = data.msg;
			})
                  }
              
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', '$routeParams', 'trademarkService', 'editCountryModal',
         function($scope, $rootScope, $routeParams, trademarkService, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkService.editMarksInCountry($routeParams.portfolio, $.iso, trademark)
                      .success(function(data){
                          $.message = data.msg;
				    })
                }
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', 'trademarkService', 'editCountryModal',
         function($scope, $rootScope, trademarkService, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkService.editMarksInCountry($.portfolio, $.iso, trademark)
                      .success(function(data){
                          $.message = data.msg;
			})
                }
        }])

		.controller('uploadImageCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'uploadImageModal',
         function($scope, $routeParams, $rootScope, $http, uploadImageModal){
            var $ = $scope;
            $.closeModal = function() {
                uploadImageModal.deactivate();
                $rootScope.modal = false;
      		};
         	
    		$.uploadComplete = function(content) {
	                 $.contents = content;
	                 $.message = "Image uploaded";
	                 $.url = content.url;
     		}
            
            $.saveLogo = function(mark, url){
              $http.post('/api/addLogoToGroup/' + $routeParams.portfolio + "/" + mark, { url: url})
                  .success(function(data){
                        $.message = data.msg;
                 })
              }
         }])
