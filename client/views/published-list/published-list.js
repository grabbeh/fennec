angular.module('app')
.directive('mgPublishedTrademarkList', function() {
    return {
        replace: true,
        templateUrl: '/views/published-list/published-list.html',
        scope: {
            published: '='
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
