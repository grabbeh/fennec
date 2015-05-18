angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            'items': '@',
            'paginatedMarks':'@'
        },
        link: function(scope, elem, attrs){
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
