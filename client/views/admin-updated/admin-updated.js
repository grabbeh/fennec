angular.module('app')
.directive('mgAdminActivities', function() {
    return {
        templateUrl: "/views/admin-updated/admin-updated.html",
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
