angular.module('app')

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
