angular.module('app')

.directive('mgTrademarkContainer', function() {
    return {
        scope: {
            trademark: '=',
            user: '='
        },
        replace: true,
        templateUrl: '/views/trademark-container/trademark-container.html',
        controller: function($scope, editTrademarkModal, notificationModal, trademarkService) {
            var $ = $scope;
            $.editTrademark = function(trademark) {
                editTrademarkModal.activate({ trademark: trademark }, { broadcast: true });
            };
    
            $.deleteTrademark = function(trademark) {
                trademarkService.deleteMark(trademark)
                    .success(function(data) { notificationModal.activate({ success: data.message }, { time: 2 }) });
            };
        }
    }
})
