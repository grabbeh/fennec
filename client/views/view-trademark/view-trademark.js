angular.module('app')

.controller('trademarkViewCtrl', ['$scope', '$rootScope', '$routeParams', 'trademark', 'trademarkService', 'user', 'editTrademarkModal',
    function($scope, $rootScope, $routeParams, trademark, trademarkService, user, editTrademarkModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.trademark = trademark;
        $.user = user;
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