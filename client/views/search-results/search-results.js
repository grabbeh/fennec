angular.module('app')
.directive('mgSearchResults', function() {
      return {
            replace: true, 
            templateUrl: '/views/search-results/search-results.html',
            scope: {
                searchResults: '=',
                showModal: '&'
            },
            controller: function($scope) {
                var $ = $scope;
                $.removeResults = function(){
                    $.searchResults = false;
                }
                $.showModalWrapper = function(trademark){
                    var func = $.showModal();
                    func(trademark);
                }

          }
      }
})
