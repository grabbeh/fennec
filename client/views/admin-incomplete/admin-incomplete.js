angular.module('app')
.directive('mgAdminIncomplete', function() {
    return {
        templateUrl: "/views/admin-incomplete/admin-incomplete.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '='
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
