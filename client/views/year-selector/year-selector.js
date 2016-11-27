angular.module('app')
.directive('mgYearSelector', function() {
    return {
        replace: true,
        templateUrl: '/views/year-selector/year-selector.html',
        scope: {
            expirySearch: '&'
        },
        controller: function($scope, $filter) {
        
            var $ = $scope;
            $.years = $filter('createTen')(new Date().getFullYear());
            $.expirySearchWrapper = function(obj) {
                var func = $.expirySearch();
                func(obj);
            }
        }
    }
})
