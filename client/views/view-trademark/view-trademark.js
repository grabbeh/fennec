angular.module('app')

.controller('trademarkViewCtrl', ['$scope', '$rootScope', '$routeParams', 'trademark', 'user',
    function($scope, $rootScope, $routeParams, trademark,  user) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.trademark = trademark;
        $.user = user;
    }
])
