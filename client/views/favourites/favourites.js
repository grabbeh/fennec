angular.module('app')

.controller('favouritesCtrl', ['$scope', '$routeParams', '$rootScope', 'favourites', 'user', 'trademarkService', 'editTrademarkModal',
    function($scope, $routeParams, $rootScope, favourites, user, trademarkService, editTrademarkModal) {
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

$.showModal = function(trademark) {
                $rootScope.modal = true;
                trademarkModal.deactivate();
                trademarkModal.activate({
                    trademark: trademark,
                    user: user
                });
            };
        $.openEditTrademarkModal = function(trademark) {
            editTrademarkModal.activate({
                trademark: trademark
            });
            $rootScope.modal = true;
        };

        $.deleteTrademark = function() {
            trademarkService.deleteMark($.trademark)
                .success(function(data) {
                    $scope.message = data.message;
                });
        };
    }
])
