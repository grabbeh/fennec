angular.module('app')

.directive('mgTrademarkContainer', function() {
    return {
        scope: {
            trademark: '=',
            user: '=',
            editTrademark: '&',
            deleteTrademark: '&'
        },
        replace: true,
        templateUrl: '/views/trademark-container/trademark-container.html',
        controller: function($scope) {
            var $ = $scope;
            $.editTrademarkWrapper = function(trademark) {
                var func = $scope.editTrademark();
                func(trademark);
            }
            $.deleteTrademarkWrapper = function(trademark) {
                var func = $scope.deleteTrademark();
                func(trademark);
            }
        }
    }
})
