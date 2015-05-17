angular.module('app')
.directive('mgSearchResults', function() {
      return {
            require: '^mgSearchPanel',
            replace: true, 
            templateUrl: '/views/search-results/search-results.html',
            scope: {
                searchResults: '='
            },
            link: function(scope, element, attrs, mgSearchPanelCtrl) {
                 scope.showModalWrapper = function(trademark){
                    var func = mgSearchPanelCtrl.showModal(trademark);
                    func(trademark);
                }
            },
            controller: function($scope) {
                $scope.removeResults = function(){
                    $scope.searchResults = false;
                }
               

          }
      }
})
