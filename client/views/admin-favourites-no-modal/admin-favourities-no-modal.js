angular.module('app')
.directive('mgAdminFavouritesNoModal', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites-no-modal/admin-favourites-no-modal.html",
        replace: true,
        scope: {
            items: '=',
            paginatedMarks:'=',
            activeTrademark: '=?'
        },
        link: function(scope, elem, attrs){
        },
         controller: function($scope) {
            var $ = $scope;
            $.activateTrademark = function(trademark) {
              $.activeTrademark = trademark;
            };
        }
    }
})
