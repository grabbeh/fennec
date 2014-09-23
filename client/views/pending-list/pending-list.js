angular.module('app')
.directive('mgPendingTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/partials/pending-list.html',
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