angular.module('app')

.controller('adminCtrl', ['$scope',
        '$routeParams',
        '$filter',
        '$rootScope',
        '$location',
        'activities',
        'trademarks',
        'trademarkService',
        'geoJsonService',
        'world',
        'countries',
        'user',
        'userService',
        'chartService',
        'barChartData',
        'barChartOptions',
        'trademarkModal',
        'notificationModal',
        '$http',

        function($scope,
            $routeParams,
            $filter,
            $rootScope,
            $location,
            activities,
            trademarks,
            trademarkService,
            geoJsonService,
            world,
            countries,
            user,
            userService,
            chartService,
            barChartData,
            barChartOptions,
            trademarkModal,
            notificationModal,
            $http) {

            var $ = $scope;
            $.activePortfolio = $routeParams.portfolio;
            $.geojson = world;
            $.trademarks = trademarks;
            $.allTrademarks = trademarks;
            $.favouriteMarks = $filter('extractFavourites')(trademarks);
            $.user = user;
            $.listOfMarks = $filter('orderBy')($filter('groupByMarks')(trademarks), 'name');
            $.listOfMarks.unshift({ name: "ALL MARKS"});
            $.chart = barChartData;
            $.options = barChartOptions;
            $.activities = activities;
            $.countries = $filter('orderBy')(countries, 'name');

            $.$on('country.click', function(e, l) {
                var c = l.target.feature.id;
                //$.$apply(function(){
                trademarkService.getCountry($routeParams.portfolio, l.target.feature.id)
                        .then(function(res){
                            if (res.length === 0)
                                notificationModal.activate({ error: "No trade marks in this country"}, {time: 2})
                            else
                                $location.path('/admin/country/' + $routeParams.portfolio).search('country', c);
                        })
                //})
                
            });

            $.showGroup = function(group) {
                if (group === null) 
                    return;
                $.activeMark = group.name;

                $.trademarks = $filter('extractGroup')($.allTrademarks, group.name);
                $.favouriteMarks = $filter('extractFavourites')($.trademarks);
                geoJsonService.getWorldGroup($routeParams.portfolio, group.name).then(function(geojson) {
                    $.geojson = geojson;
                });
                chartService.barChartData($routeParams.portfolio, group.name).then(function(barChartData) {
                    $.chart = barChartData;
                });
                $.listOfMarks = $filter('unTickAllExceptSelected')($.listOfMarks, group.name);
            };

            $.showCountry = function(country) {
                if (country === null) {
                    return;
                }
                $.trademarks = $filter('extractMarksInCountry')($.allTrademarks, country.alpha3);
                $.favouriteMarks = $filter('extractFavourites')($.trademarks);
                geoJsonService.getWorldGroup($routeParams.portfolio, null, country.alpha3).then(function(geojson) {
                    $.geojson = geojson;
                });

                chartService.barChartData($routeParams.portfolio, null, country.alpha3).then(function(barChartData) {
                    $.chart = barChartData;
                });

                //$.marks = $filter('unTickAllExceptSelected')($.marks, country);
                $.activeMark = country.name;
            };

            $.expiryFormValid = function() {
                return $.expiryForm.$valid;
            };

            $.goToGroup = function(group) {
                $location.path('/admin/group/' + $routeParams.portfolio).search('group', group.name);
            };

            $.goToCountry = function(country) {
                    trademarkService.getCountry($routeParams.portfolio, country)
                        .then(function(res){
                            $location.path('/admin/country/' + $routeParams.portfolio).search('country', country.alpha3);
                        }, function(){
                            notificationModal.activate({ error: "No trade marks in this country"})
                        })
            };

            $.$watch('trademarks', function(trademarks) {
                if (!trademarks) {
                    return;
                }

                $.incompleteMarks = $filter('incompleteMarks')(trademarks);
                $.sortedByExpiry = $filter('fromNow')($filter('sortByExpiryDate')($filter('extractRegisteredMarks')(trademarks)));
                $.pieData = chartService.pieChartData(trademarks);
                $.pieOptions = chartService.pieChartOptions();
                $.chartSubtitles = chartService.pieChartSubtitles(trademarks);
            });

            $.expirySearch = function(year) {
                $location.path('/admin/expiring/' + $routeParams.portfolio + '/' + year);
            };
        }
    ])
