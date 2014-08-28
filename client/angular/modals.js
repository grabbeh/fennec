angular.module('app')

         .controller('loginModalCtrl', ['$scope', '$window', 'pathService', 'userService', '$location',  '$rootScope', '$routeParams','loginModal', function($scope, $window, pathService, userService, $location, $rootScope, $routeParams, loginModal){
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
                        $window.sessionStorage.token = res.token;
                        $rootScope.user = true;
                        $rootScope.modal = false;
                        loginModal.deactivate();
                        if (pathService.returnPath() === undefined){
                            $location.path('/select-portfolio');
                        }
                        else {
                            $location.path(pathService.returnPath());
                        }
                    }, 
                    function(err){
                        $.message = err.message;
                    });
                }
  
         }])
	
	.controller('mainMenuModalCtrl', ['$scope', '$window', '$location',  '$rootScope', '$routeParams','mainMenuModal', function($scope, $window, $location, $rootScope, $routeParams, $window, mainMenuModal){
	        var $ = $scope;
	        
	        $.closeModal = function(){
	            mainMenuModal.deactivate();
	            $rootScope.modal = false;
	        }
  
	        $.logout = function(){
	            $rootScope.user = false;
	            delete $window.sessionStorage.token;
	            $rootScope.mainMenuModal = false;
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
    
    .controller('trademarkModalCtrl', ['$scope', '$timeout', '$rootScope', 'userService', 'trademarkService', '$http', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, $timeout, $rootScope, userService, trademarkService, $http, editTrademarkModal, trademarkModal) {
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
                $.message = res.data.message;
            })
          }
    
      $.deleteTrademark = function(trademark){
        userService.isAdmin().then(function(res){
            trademarkService.deleteMark(trademark)
               .success(function(data){
                   $scope.message = data.message;
               })
            }, function(res){
                $.message = res.data.message;
                $timeout(function(){
                	trademarkModal.deactivate();
                	$rootScope.modal = false;
                }, 1000)
            })
        }
    }])
  
    
    .controller('editTrademarkModalCtrl', ['$scope', '$rootScope', '$http', 'trademarkService', 'editTrademarkModal',
      function ($scope, $rootScope, $http, trademarkService, editTrademarkModal) {
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
                    $.message = data.message;
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
