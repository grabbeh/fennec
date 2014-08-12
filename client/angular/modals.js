angular.module('app')

	.controller('menuModalCtrl', ['$scope', '$location', '$http', '$rootScope', '$routeParams','$window', 'menuModal', function($scope, $location, $http, $rootScope, $routeParams, $window, menuModal){
        var $ = $scope;
        $.closeModal = function(){
            menuModal.deactivate();
            $rootScope.modal = false;
            $rootScope.menuModal = false;
        }
        
        $.getJSON = function(){
                $window.open('/api/downloadTrademarks/' + $routeParams.portfolio)
            };
            
        $.logout = function(){
                $http.get('/api/logout')
                    .success(function(){
                        $rootScope.user = false;
                        $location.path('/');
                })
        }
      
    }])
    
    .controller('trademarkModalCtrl', ['$scope', '$timeout', '$rootScope', 'userGetter', 'trademarkReviser', '$http', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, $timeout, $rootScope, userGetter, trademarkReviser, $http, editTrademarkModal, trademarkModal) {
      var $ = $scope;
      
      $.alpha2 = $.trademark.country.alpha2.toLowerCase();
      
      $.closeModal = function() {
        trademarkModal.deactivate();
        $rootScope.modal = false;
      };
    
      $.openEditTrademarkModal = function(trademark){
        userGetter.isAdmin().then(function(){
                trademarkModal.deactivate();
                editTrademarkModal.activate({trademark: trademark})
            }, function(res){
                $.message = res.data.message;
            })
          }
    
      $.deleteTrademark = function(trademark){
        userGetter.isAdmin().then(function(res){
            trademarkReviser.deleteMark(trademark)
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
  
    
    .controller('editTrademarkModalCtrl', ['$scope', '$rootScope', '$http', 'trademarkReviser', 'editTrademarkModal',
      function ($scope, $rootScope, $http, trademarkReviser, editTrademarkModal) {
          var $ = $scope;
          $.closeModal = function() {
            editTrademarkModal.deactivate();
            $rootScope.modal = false;
          };
    
          $.statuses = ["Registered", "Published", "Pending"];
    
    
        $http.get('/api/countrydata')
            .success(function(data){
                $.countrydata = data;
            })
    
        $.editTrademark = function(trademark){
            trademarkReviser.editMark(trademark)
                .success(function(data){
                    $.message = data.message;
                });
            }
       
    }])

	.controller('editGroupCtrl', ['$scope', '$rootScope', '$routeParams', '$http', 'trademarkReviser', 'editGroupModal',
         function($scope, $rootScope, $routeParams, $http, trademarkReviser, editGroupModal){
              var $ = $scope;
              $.closeModal = function() {
                    editGroupModal.deactivate();
                    $rootScope.modal = false;
              };
             
              $.editGroup = function(trademark){
                  trademarkReviser.editGroup($.portfolio, $.mark, trademark)
                      .success(function(data){
                          $.message = data.msg;
			})
                  }
              
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', '$routeParams', 'trademarkReviser', 'editCountryModal',
         function($scope, $rootScope, $routeParams, trademarkReviser, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkReviser.editMarksInCountry($routeParams.portfolio, $.iso, trademark)
                      .success(function(data){
                          $.message = data.msg;
				})
             }
         }])

	.controller('editCountryCtrl', ['$scope', '$rootScope', 'trademarkReviser', 'editCountryModal',
         function($scope, $rootScope, trademarkReviser, editCountryModal){
                var $ = $scope;
                $.closeModal = function() {
                    editCountryModal.deactivate();
                    $rootScope.modal = false;
          		};
             
                $.editCountry = function(trademark){
                    trademarkReviser.editMarksInCountry($.portfolio, $.iso, trademark)
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
