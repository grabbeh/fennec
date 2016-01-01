angular.module('app')
.directive('mgAdminIncomplete', function() {
    return {
        templateUrl: "/views/admin-incomplete/admin-incomplete.html",
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
