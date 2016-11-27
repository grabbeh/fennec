angular.module('app')

.directive('mgAdminMenu', function() {
    return {
        templateUrl: '/views/admin-menu/admin-menu.html',
        replace: true,
        scope: {
            activePortfolio: '=',
            swipeEvent: '='
        }
    }
})