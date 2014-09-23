angular.module('app')

.controller('countryViewCtrl', ['$scope', '$rootScope', '$location', 'user', '$filter', '$http', '$routeParams', 'geoJsonService', 'trademarkService', 'editTrademarkModal', 'trademarkModal',
    function($scope, $rootScope, $location, user, $filter, $http, $routeParams, geoJsonService, trademarkService, editTrademarkModal, trademarkModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;

        trademarkService.getCountry($routeParams.portfolio, $location.search().country).then(function(trademarks) {
            $.trademarks = trademarks;
            $.trademark = trademarks[0];
            $.countries = $filter('extractCountries')($.trademarks);
            if (_.every($.countries, function(c) {
                return c === "European Union";
            })) {
                $.country = "European Union";
            } else {
                $.country = _.without($.countries, "European Union")[0];
            }
        });

        trademarkService.getListOfMarks($routeParams.portfolio, $location.search().country)
            .then(function(list) {
                $.marks = list;
            });

        $.$watch('trademarks', function(data) {
            if (!data) {
                return;
            }
            $.nocontent = true;
            $.registered = false;
            $.published = false;
            $.pending = false;

            $.countryTM = data[0];
            $.sortedByStatus = _.groupBy(data, 'status');
            $.chartSubtitles = $filter('groupByStatus')(data);

            $.nocontent = false;

            if ($.sortedByStatus.Registered){
                $.registered = $.sortedByStatus.Registered;}
            if ($.sortedByStatus.Published){
                $.published = $.sortedByStatus.Published;}
            if ($.sortedByStatus.Pending){
                $.pending = $.sortedByStatus.Pending;}
        });

        $.showModal = function(trademark) {
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({
                trademark: trademark,
                user: user
            });
        };

        $.sendMarksToServer = function(marks) {
            $http.post('/api/country/' + $routeParams.portfolio + "/" + $location.search().country, {
                    marks: $filter('extractCheckedMarks')(marks)
                })
                .success(function(trademarks) {
                    $.trademarks = trademarks;
                });
        };

    }
])