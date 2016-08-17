angular.module('app')

.controller('addTrademarkCtrl', ['$scope', '$http', 'trademarkService', '$routeParams', 'notificationModal', 'countryData',
    function($scope, $http, trademarkService, $routeParams, notificationModal, countryData) {
        var $ = $scope;
        var self = this;
        this.trademark = {};
        this.trademark.classes = [];
        this.activePortfolio = $routeParams.portfolio;
        this.countrydata = countryData;

        this.addTrademark = function(trademark) {
            trademarkService.addMark(trademark, $routeParams.portfolio)
                .success(function(data) { 
                    notificationModal.activate({ success: data.message });
                })
        };
        
        this.canAddTrademark = function() {
            return self.addTrademarkForm.$valid;
        };
    }
])
