angular.module('app')
.directive('mgSearchInput', function() {
    return {
        templateUrl: "/views/search-input/search-input.html",
        replace: true,
        scope: {
            searchResults: '='
        },
        controller: function($scope, $http, notificationModal) {
            var $ = $scope;
            $.search = "";
            $.search = function() {
                if ($.query === "")
                    notificationModal.activate({ error: "Please provide a search term"}, { time: 2 })
                $http.post('/api/search', { query: $.query })
                    .success(function(data) {
                        if (data.length === 0) {
                            notificationModal.activate({ error: "No results" }, { time: 2 })
                            $.searchResults = false;
                        } else 
                            $.searchResults = data;
                    })
                    .error(function() {
                        // deal with error handling
                    });
            }

            $.canSearch = function() {
                return $.searchForm.$valid;
            }

            $.canExpirySearch = function() {
                return $.searchForm.$valid;
            }

            $.removeNoResults = function() {
                $.noresults = false;
            }
        }
    }
})
