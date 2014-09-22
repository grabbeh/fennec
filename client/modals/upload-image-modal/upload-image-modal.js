angular.module('app')

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
