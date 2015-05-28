angular.module('app')

.controller('portfolioHomeCtrl', ['$scope', 'trademarkModal', 'user', '$window', '$rootScope', '$filter', '$routeParams', 'countries', 'marks', '$location',
        function($scope, trademarkModal, user, $window, $rootScope, $filter, $routeParams, countries, marks, $location) {
            var $ = $scope;
            $.activePortfolio = $routeParams.portfolio;
            $.portfolios = user.portfolios;
            $.countries = $filter('orderBy')(countries, 'name');
            $.marks = marks;

            $.changePortfolio = function(portfolio) {
                if (portfolio === null) {
                    return;
                }
                $.activePortfolio = portfolio;
                $location.path('/home/' + portfolio);
            };

            $.goToGroup = function(country) {
                $location.path('/admin/group/' + $routeParams.portfolio).search('group', country.name);
            };

            $.goToCountry = function(country) {
                $location.path('/admin/country/' + $routeParams.portfolio).search('country', country.alpha3);
            };

            $.showModal = function(trademark) {
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark });
            };

        }
    ])
