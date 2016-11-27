angular.module('app')

	.controller('uploadImageCtrl', ['$scope', '$window', 'Upload', '$routeParams', '$rootScope', '$http', 'uploadImageModal',
         function($scope, $window, Upload, $routeParams, $rootScope, $http, uploadImageModal){
            var $ = $scope;
            $.closeModal = function() {
                uploadImageModal.deactivate();
                $rootScope.modal = false;
      		};

            $.upload = function(){
                if ($.files && $.files.length) {
                    for (var i = 0; i < $.files.length; i++) {
                        var file = $.files[i];
                        Upload.upload({
                            url: 'api/upload',
                            file: file
                        }).success(function (r) {
                                 $.message = "Image uploaded";
                                 $.url = r.url;
                        });
                    }
                }
            };
            
            $.saveLogo = function(mark, url){
                $http.post('/api/addLogoToGroup/' + $routeParams.portfolio + "/" + mark, { url: url})
                    .success(function(data){
                        $.message = data.msg;
                })
            }
        }])
