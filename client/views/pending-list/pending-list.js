angular.module('app')
.directive('mgPendingTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/views/pending-list/pending-list.html',
        scope: {
            pending: '='
        },
        controller: function($scope, trademarkModal) {
            var $ = $scope;
             $.showModal = function(trademark) {
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark }, { broadcast: true })
            }
        }
    }
})
