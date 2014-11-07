angular.module('app')

.controller('addTrademarkCtrl', ['$scope', '$http', 'trademarkService', '$routeParams', 'notificationModal',
    function($scope, $http, trademarkService, $routeParams, notificationModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $http.get('/api/countrydata')
            .success(function(data) {
                $.countrydata = data;
            });

        $.addTrademark = function(trademark) {
            trademarkService.addMark(trademark, $routeParams.portfolio)
                .success(function(data) { notificationModal.activate({ success: data.message });};
        };
        
        $.canAddTrademark = function() {
            return $.addTrademarkForm.$valid;
        };
    }
])
