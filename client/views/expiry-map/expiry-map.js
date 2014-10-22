angular.module('app')

.controller('expiryCtrl', ['$scope', '$filter', '$rootScope', '$routeParams', '$location', 'geoJsonService', 'editTrademarkModal', 'trademarkModal',
    function($scope, $filter, $rootScope, $routeParams, $location, geoJsonService, editTrademarkModal, trademarkModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.activeYear = $routeParams.year;
        geoJsonService.getExpiriesForYear($routeParams.portfolio, $routeParams.year).then(function(response) {
            $.geojson = response.data;
        });

        $.$on('country.click', function(e, l) {
            $.registered = false;
            $.nocontent = true;
            $.$apply(function() {
                $.country = l.target.feature.properties.name;
                var tms = l.target.feature.properties.trademarks;
                if (tms) {
                    $.nocontent = false;
                    if (tms.Registered){
                        $.registered = tms.Registered;}
                }

            });
        });

        $.showModal = function(trademark) {
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({
                trademark: trademark
            });
        };

        $.expiryFormValid = function() {
            return $.expiryForm.$dirty && $.expiryForm.$valid;
        };

        $.changeYear = function(year) {
            $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + year);
        };

        $.years = $filter('createTen')(new Date().getFullYear());

    }
])
