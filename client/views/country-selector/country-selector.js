angular.module('app')
.directive('mgCountrySelector', function() {
    return {
        replace: true,
        templateUrl: '/views/country-selector/country-selector.html',
        scope: {
            countries: '=',
            goToGroup: '&',
            title: '@'
        },
        controller: function($scope) {
            var $ = $scope;
            $.goToGroupWrapper = function(obj) {
                var func = $.goToGroup();
                func(obj);
            }
        }
    }
})
