angular.module('app')
.directive('mgRegisteredTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/views/registered-list/registered-list.html',
        scope: {
            registered: '='
        },
        controller: function($scope, trademarkModal) {
            var $ = $scope;
             $.showModal = function(trademark) {
                console.log("Item clicked");
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark }, { broadcast: true })
            }
        }
    }
})
