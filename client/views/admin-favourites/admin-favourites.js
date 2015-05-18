angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
        },
        link: function(scope, elem, attrs, mgPaginatorCtrl){
            console.log(mgPaginatorCtrl);
            scope.paginatedMarks = mgPaginatorCtrl.paginatedMarks;
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
