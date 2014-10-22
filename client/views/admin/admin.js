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
        '$moment',
        'trademarkModal',
        'menuModal',
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
            $moment,
            trademarkModal,
            menuModal,
            $http) {

            var $ = $scope;
            $.activePortfolio = $routeParams.portfolio;
            $.geojson = world;
            $.trademarks = trademarks;
            $.allTrademarks = trademarks;
            $.favouriteMarks = $filter('extractFavourites')(trademarks);
            $.user = user;
            $.marks = $filter('orderBy')($filter('groupByMarks')(trademarks), 'name');
            $.marks.unshift({
                name: "ALL MARKS"
            });
            $.chart = barChartData;
            $.options = barChartOptions;
            $.activities = activities;
            $.countries = $filter('orderBy')(countries, 'name');

            $.$on('country.click', function(e, l) {
                $.$apply(function() {
                    $location.path('/admin/country/' + $routeParams.portfolio).search('country', l.target.feature.id);
                });
            });

            $.showGroup = function(group) {
                if (group === null) 
                    return;
                $.activeMark = group.name;

                $.trademarks = $filter('extractGroup')($.allTrademarks, group.name);
                geoJsonService.getWorldGroup($routeParams.portfolio, group.name).then(function(geojson) {
                    $.geojson = geojson;
                });
                chartService.barChartData($routeParams.portfolio, group.name).then(function(barChartData) {
                    $.chart = barChartData;
                });
                $.marks = $filter('unTickAllExceptSelected')($.marks, group.name);
            };

            $.showCountry = function(country) {
                if (country === null) {
                    return;
                }
                $.trademarks = $filter('extractMarksInCountry')($.allTrademarks, country.alpha3);
                geoJsonService.getWorldGroup($routeParams.portfolio, null, country.alpha3).then(function(geojson) {
                    $.geojson = geojson;
                });

                chartService.barChartData($routeParams.portfolio, null, country.alpha3).then(function(barChartData) {
                    $.chart = barChartData;
                });

                //$.marks = $filter('unTickAllExceptSelected')($.marks, country);
                $.activeMark = country.name;
            };

            $.showModal = function(trademark) {
                $rootScope.modal = true;
                trademarkModal.deactivate();
                trademarkModal.activate({
                    trademark: trademark,
                    user: user
                });
            };

            $.expiryFormValid = function() {
                return $.expiryForm.$dirty && $.expiryForm.$valid;
            };

            $.sendMarksToServer = function(marks) {
                $http.post('/api/world/' + $routeParams.portfolio, {
                        marks: $filter('extractCheckedMarks')(marks)
                    })
                    .success(function(world) {
                        $.geojson = world;
                    });
            };

            $.goToGroup = function(group) {
                $location.path('/admin/group/' + $routeParams.portfolio).search('group', group.name);
            };

            $.goToCountry = function(country) {
                $location.path('/admin/country/' + $routeParams.portfolio).search('country', country.alpha3);
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
            $.years = $filter('createTen')(new Date().getFullYear());
            //$.min = new Date().getFullYear();
        }
    ])
