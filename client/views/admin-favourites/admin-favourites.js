angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
        },
        link: function(scope, elem, attrs, mgPaginatorCtrl){
            if (!mgPaginatorCtrl.getData()){
                mgPaginatorCtrl.getData();
            }
            scope.items = mgPaginatorCtrl.getData();
            console.log(scope.items);
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
