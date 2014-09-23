angular.module('app')

.controller('addCtrl', ['$scope', '$http', 'trademarkService', '$routeParams',
    function($scope, $http, trademarkService, $routeParams) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $http.get('/api/countrydata')
            .success(function(data) {
                $.countrydata = data;
            });

        $.addTrademark = function(trademark) {
            trademarkService.addMark(trademark, $routeParams.portfolio)
                .success(function(data) {
                    $.message = data.message;
                });
        };
        $.canAddTrademark = function() {
            return $.addTrademarkForm.$dirty && $.addTrademarkForm.$valid;
        };
    }
])