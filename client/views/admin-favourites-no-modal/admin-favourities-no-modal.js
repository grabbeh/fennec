angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        require: '^mgPaginator',
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            items: '=',
            paginatedMarks:'=',
            activeTrademark: '='
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
