angular.module('app')
.directive('mgRegisteredTrademarkList', function(checkIfClassesFilter) {
    return {
        replace: true,
        templateUrl: '/views/registered-list/registered-list.html',
        scope: {
            registered: '=',
            showModal: '&'
        },
        controller: function($scope) {
            var $ = $scope;
            $.showModalWrapper = function(tm) {
                var func = $scope.showModal();
                func(tm);
            }
        }
    }
})
