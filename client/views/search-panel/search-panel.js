angular.module('app')
.directive('mgSearchPanel', function() {
      return {
            replace: true, 
            templateUrl: '/views/search-panel/search-panel.html',
            scope: {
                activePortfolio: '=',
                swipeEvent: '='
            }
      }
})
