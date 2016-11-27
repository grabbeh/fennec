angular.module('app')

.controller('favouritesCtrl', ['$scope', '$routeParams', '$rootScope', 'favourites', 'user', 'trademarkService', 'editTrademarkModal', 'trademarkModal',
    function($scope, $routeParams, $rootScope, favourites, user, trademarkService, editTrademarkModal, trademarkModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.favourites = favourites;
        if (favourites.length === 0) {
            $.favourites = false;
        }
        $.user = user;
        $.activeTrademark = favourites[0];
        $.activateTrademark = function(trademark) {
            $.activeTrademark = trademark;
        };
    }
])
