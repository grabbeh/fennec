angular.module('app')

.controller("mapCtrl", ['$scope', 'countryData', 'user', '$routeParams', '$filter', '$rootScope', 'world', 'trademarks', '$http', 'editTrademarkModal', 'trademarkModal',
    function($scope, countryData, user, $routeParams, $filter, $rootScope, world, trademarks, $http, editTrademarkModal, trademarkModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.countries = $filter('orderBy')(countryData, 'name');
        $.geojson = world;
        $.listOfMarks = $filter('groupByMarks')(trademarks);
        $.listOfMarks.unshift({ name: "ALL MARKS" });

        $.sendMarksToServer = function(marks) {
            $http.post('/api/world/' + $routeParams.portfolio, { marks: $filter('extractCheckedMarks')(marks) })
                .success(function(world) { $.geojson = world; });
        };

        $.$on('country.click', function(e, l) {
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            $.$apply(function() {
                $.country = l.target.feature.properties.name;
                var tms = l.target.feature.properties.trademarks;
                if (tms) {
                    $.nocontent = false;
                    if (tms.Registered)
                        $.registered = tms.Registered;

                    if (tms.Published)
                        $.published = tms.Published;

                    if (tms.Pending)
                        $.pending = tms.Pending;
                }

            });
        });

        $.showCountry = function(country) {
            if (!country) {
                return;
            }
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            _.each($.geojson, function(feature) {
                if (country.alpha3 === feature.id) {
                    var tms = feature.properties.trademarks;
                    $.country = feature.properties.name;
                    if (tms) {
                        $.nocontent = false;
                        if (tms.Registered){
                            $.registered = tms.Registered;}
                        if (tms.Published){
                            $.published = tms.Published;}
                        if (tms.Pending){
                            $.pending = tms.Pending;}
                    }
                }
            });
        };
        $.showModal = function(trademark) {
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark }, { broadcast: true });
        };

    }
]);
