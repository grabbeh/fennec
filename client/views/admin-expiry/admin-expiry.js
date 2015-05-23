angular.module('app')
.directive('mgAdminExpiry', function() {
    return {
        templateUrl: "/views/admin-expiry/admin-expiry.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '=',
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
