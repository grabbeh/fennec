angular.module('app')
    .component('mgAddTrademark', {
        scope: {},
        controller: function($route, trademarkService, $routeParams, notificationModal) {
                var self = this;
                this.$onInit = function(){
                    this.countryData = $route.current.locals.countryData;
                    this.trademark = {};
                    this.trademark.classes = [];
                    this.activePortfolio = $routeParams.portfolio;
                    this.addTrademark = (trademark) => {
                        trademarkService.addMark(trademark, $routeParams.portfolio)
                            .success(function(data) { 
                                notificationModal.activate({ success: data.message });
                            })
                    };
                    this.canAddTrademark = function() {
                        return self.addTrademarkForm.$valid;
                    };
                }
        },
        bindings: {
            countryData: '<'
        },
        controllerAs: 'atm',
        templateUrl: '/views/add-trademark/add-trademark.html'
});