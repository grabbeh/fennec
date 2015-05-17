angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '='
        },
         controller: function($scope, trademarkModal) {
            var $ = $scope;
            $.showModal = function(trademark) {
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark })
            }
        }
    }
})
