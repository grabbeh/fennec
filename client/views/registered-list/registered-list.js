angular.module('app')
.directive('mgRegisteredTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/views/registered-list/registered-list.html',
        scope: {
            registered: '=',
            showModal: '&'
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
