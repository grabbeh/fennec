angular.module('app')
.directive('mgAdminFavourites', function() {
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
            console.log($.items)
            $.activateTrademark = function(trademark) {
              $.activeTrademark = trademark;
            };
        }
    }
})
