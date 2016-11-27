angular.module('app')
.directive('mgSearchResults', function() {
      return {
            replace: true, 
            templateUrl: '/views/search-results/search-results.html',
            scope: {
                searchResults: '='
            },
            controller: function($scope, trademarkModal) {
                $scope.removeResults = function(){
                    $scope.searchResults = false;
                }
                
                $scope.showModal = function(trademark) {
                    trademarkModal.deactivate();
                    trademarkModal.activate({ trademark: trademark }, { broadcast: true })
                }
               

          }
      }
})
