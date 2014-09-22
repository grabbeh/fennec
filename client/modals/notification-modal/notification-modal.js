angular.module('app')

.controller('notificationModalCtrl', ['$scope', 'notificationModal', function($scope, notificationModal){
    var $ = $scope;
    $.closeModal = function(){
        notificationModal.deactivate();
    }

}])