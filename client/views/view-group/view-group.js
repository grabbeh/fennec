angular.module('app')

.controller('groupViewCtrl', ['$scope', '$rootScope', '$location', 'user', '$filter', '$http', '$routeParams', 'geoJsonService', 'trademarkService', 'editTrademarkModal', 'trademarkModal', 'editGroupModal', 'uploadImageModal',
    function($scope, $rootScope, $location, user, $filter, $http, $routeParams, geoJsonService, trademarkService, editTrademarkModal, trademarkModal, editGroupModal, uploadImageModal) {
        var $ = $scope;
        $.activePortfolio = $routeParams.portfolio;
        geoJsonService.getWorldGroup($routeParams.portfolio, $location.search().group).then(function(data) {
            $.geojson = data;
        });

        trademarkService.getGroup($routeParams.portfolio, $routeParams.group).then(function(data) {
            $.title = $location.search().group;
            $.trademarks = data;
            $.chartSubtitles = $filter('groupByStatus')($.trademarks);
        });

        trademarkService.getListOfMarks($routeParams.portfolio)
            .then(function(response) {
                $.marks = response;
            });

        $.showModal = function(trademark) {
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark }, {broadcast: true});
        };

        $.showEditGroupModal = function() {
            $rootScope.modal = true;
            var mark = $.trademarks[0].mark;
            editGroupModal.activate({
                trademark: $.trademarks[0],
                mark: mark,
                portfolio: $routeParams.portfolio
            }, { broadcast: true });
        };

        $.goToGroup = function(group) {
            $location.search('group', group.name);
            $.title = $location.search().group;
            geoJsonService.getWorldGroup($routeParams.portfolio, group.name).then(function(data) {
                $.geojson = data;
            });
            trademarkService.getGroup($routeParams.portfolio, group.name).then(function(data) {
                $.trademarks = data;
                $.chartSubtitles = $filter('groupByStatus')($.trademarks);
            });


        };

        $.showUploadImageModal = function() {
            $rootScope.modal = true;
            var id = $.trademarks[0].mark;
            uploadImageModal.activate({
                id: id
            }, { broadcast: true });
        };

        $.$on('country.click', function(e, l) {
            $.registered = false;
            $.pending = false;
            $.published = false;
            $.nocontent = true;
            $.$apply(function() {
                $.country = l.target.feature.properties.name;
                $.alpha2 = l.target.feature.alpha2.toLowerCase();
                $.alpha3 = l.target.feature.id;

                var tms = l.target.feature.properties.trademarks;
                if (tms) {
                    $.nocontent = false;
                    if (tms.Registered){
                        $.registered = tms.Registered;}

                    if (tms.Published){
                        $.published = tms.Published;}

                    if (tms.Pending){
                        $.pending = tms.Pending;}
                }

            });
        });

    }
])
