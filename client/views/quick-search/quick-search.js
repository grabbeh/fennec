angular.module('app')

.controller('quickSearchCtrl', ['$scope', '$filter', '$http', '$routeParams', '$location', 'trademarkService',
    function($scope, $filter, $http, $routeParams, $location, trademarkService) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $http.get('/api/countryData')
            .success(function(countries) {
                $.countrydata = $filter('orderBy')(countries, 'name');
            });

        trademarkService.getListOfMarks($routeParams.portfolio)
            .then(function(data) {
                $.marks = data;
            });


        $.searchTrademarks = function(tm, country) {
            return $http.get('/api/searchTrademarks/' + $routeParams.portfolio + '?group=' + tm + '&country=' + country)
                .then(function(response) {
                    $location.search({
                        group: tm,
                        country: country
                    });
                    return response.data;
                });
        };

        $.selectMark = function() {
            if ($.country === undefined) {
                $.message = "Now provide a country";
                return;
            }

            $.searchTrademarks($.mark.name, $.country.alpha3).then(function(marks) {
                $scope.message = "";
                if (marks.length > 0) {
                    $.result = "Use the 'R' symbol for the following:";
                    $.classes = $filter('orderBy')($filter('addSpecifications')($filter('extractClasses')(marks)), 'clss');
                } else {
                    $.result = "Use the 'TM' symbol";
                    $.classes = "";
                }
            });

        };

        $scope.quickSearch = function() {
            if ($.mark === undefined) {
                $.message = "Now provide a mark";
                return;
            }

            $.searchTrademarks($.mark.name, $.country.alpha3).then(function(marks) {
                $scope.message = "";
                if (marks.length > 0) {
                    $.result = "Use the 'R' symbol for the following";
                    $.classes = $filter('orderBy')($filter('addSpecifications')($filter('extractClasses')(marks)), 'clss');
                } else {
                    $.result = "Use the 'TM' symbol";
                    $.classes = "";
                }
            });
        };
    }
])