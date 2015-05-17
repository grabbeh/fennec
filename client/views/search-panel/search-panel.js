angular.module('app')
.directive('mgSearchPanel', function() {
      return {
            replace: true, 
            templateUrl: '/views/search-panel/search-panel.html',
            scope: {
                activePortfolio: '=',
                showModal:"&",
                swipeEvent: '='
            },
            controller: function($scope) {
                var $ = $scope;
                this.showModal = $scope.showModal;
          }
      }
})
