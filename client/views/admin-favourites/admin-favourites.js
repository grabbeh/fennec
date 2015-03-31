angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '=',
            //showModal: '&'
        },
        link: function(scope, element, attrs, mgPaginatorCtrl){
            var $ = scope;
            $.innerShowModal = function(tm){
                console.log(mgPaginatorCtrl);
                var func = mgPaginatorCtrl.outerShowModal();
                func(tm);
            }
            
        }/*,
         controller: function($scope) {
            var $ = $scope;
            $.innerShowModal = function(tm) {
                var func = $.showModal();
                func(tm);
            }
        }*/
    }
})
