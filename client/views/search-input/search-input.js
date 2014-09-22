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
            $.search = function() {
                $http.post('/api/search', {
                        query: $.query
                    })
                    .success(function(data) {
                        if (data.length === 0) {
                            notificationModal.activate({
                                error: "No results"
                            })
                            $.searchResults = false;
                        } else {
                            $.searchResults = data;
                        }
                    })
                    .error(function() {
                        // deal with error handling
                    });
            }

            $.canSearch = function() {
                return $.searchForm.$dirty && $.searchForm.$valid;
            }

            $.canExpirySearch = function() {
                return $.expiryForm.$dirty && $.searchForm.$valid;
            }

            $.removeNoResults = function() {
                $.noresults = false;
            }
        }
    }
})