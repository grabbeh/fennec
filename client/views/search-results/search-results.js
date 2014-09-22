angular.module('app')
.directive('mgSearchResult', function() {
    return {
        templateUrl: '/views/search-results/search-results.html',
        restrict: 'A'
    };

})