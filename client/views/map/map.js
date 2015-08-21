angular.module('app')

.controller("mapCtrl", ['$scope', 'countryData', 'user', '$routeParams', '$filter', '$rootScope', 'world', 'trademarks', '$http', 'editTrademarkModal', 'trademarkModal', 'notificationModal',
    function($scope, countryData, user, $routeParams, $filter, $rootScope, world, trademarks, $http, editTrademarkModal, trademarkModal, notificationModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        $.countries = $filter('orderBy')(countryData, 'name');
        $.geojson = world;
        $.listOfMarks = $filter('groupByMarks')(trademarks);
        $.listOfMarks.unshift({ name: "ALL MARKS" });

        $.$on('country.click', function(e, l) {
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.$apply(function() {
                $.country = l.target.feature.properties.name;
                var tms = l.target.feature.properties.trademarks;
                if (tms) 
                    updateListings(tms);
                else 
                     notificationModal.activate({ error: "No trade marks in this country"}, {time: 2});
            });
        });

        $.showCountry = function(country) {
            if (!country) {
                return;
            }
            $.registered = false;
            $.pending = false;
            $.published = false;
            _.each($.geojson, function(feature) {
                if (country.alpha3 === feature.id) {
                    var tms = feature.properties.trademarks;
                    $.country = feature.properties.name;
                    if (tms) 
                        updateListings(tms);
                    else 
                        notificationModal.activate({ error: "No trade marks in this country"}, {time: 2});
                }
            });
        };
        function updateListings(tms){
            $.nocontent = false;
            if (tms.Registered)
                $.registered = tms.Registered;
            if (tms.Published)
                $.published = tms.Published;
            if (tms.Pending)
                $.pending = tms.Pending;   
        }
    }
]);
