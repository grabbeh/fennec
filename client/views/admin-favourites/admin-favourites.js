angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '=',
            showModal: '&'
        },
         controller: function($scope) {
            var $ = $scope;
            $.innerShowModal = function(tm) {
                var func = $.showModal();
                func(tm);
            }
        }
    }
})