angular.module('app')
.directive('mgPublishedTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/views/published-list/published-list.html',
        scope: {
            published: '=',
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
