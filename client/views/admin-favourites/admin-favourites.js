angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '='//,
            //showModal: '&'
        },
        link: function(scope, element, attrs, mgPaginatorCtrl){
            var $ = scope;
            console.log(mgPaginatorCtrl.outerShowModal());
            $.innerShowModal = function(tm){
                console.log(tm);
                console.log(mgPaginatorCtrl);
                var func = mgPaginatorCtrl.outerShowModal();
                console.log(func);
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
