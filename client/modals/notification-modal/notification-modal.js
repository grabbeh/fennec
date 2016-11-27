angular.module('app')

.controller('notificationModalCtrl', ['$scope', '$rootScope', 'notificationModal', function($scope, $rootScope, notificationModal){
    var $ = $scope;
    $.closeModal = function(){
        notificationModal.deactivate();
        $rootScope.modal = false;
    }

}])