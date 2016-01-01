angular.module('app')
.directive('mgAdminExpiry', function() {
    return {
        templateUrl: "/views/admin-expiry/admin-expiry.html",
        replace: true,
        scope: {
            items: '=',
            user: '='
        },
         controller: function($scope, trademarkModal) {
            var $ = $scope;
            $.showModal = function(trademark) {
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark, user: $.user }, { broadcast: true })
            }
        }
    }
})
