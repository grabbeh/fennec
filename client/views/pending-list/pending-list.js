angular.module('app')
.directive('mgPendingTrademarkList', function(checkIfClassesFilter) {
    return {
        replace: true,
        templateUrl: '/views/pending-list/pending-list.html',
        scope: {
            pending: '=',
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
