angular.module('app')

.directive('mgMarkListDisplayer', function() {
    return {
        templateUrl: '/views/mark-list-displayer/mark-list-displayer.html',
        scope: {
            listOfMarks: '=',
            trademarks: '=?',
            geojson: '=?'
        },
        controller: function($scope, $filter, $http, $routeParams, $location) {
            var $ = $scope;

            $.filterMarks = function() {
                $.submitMarks($.listOfMarks);
            };

            $.toggleMark = function(index) {
                angular.forEach($.listOfMarks, function(mark, i) {
                    if (index === i) {
                        mark.checked = !mark.checked;
                    }
                })
                $.submitMarks($.listOfMarks);
            }

            $.untickAll = function() {
                $filter('untickAll')($.listOfMarks);
                $.submitMarks($.listOfMarks);
            }

            $.tickAll = function() {
                $filter('tickAll')($.listOfMarks);
                $.submitMarks($.listOfMarks);
            };
            
            $.submitMarks = function(marks) {
                console.log(marks);
                var baseurl = "/api";
                if ($.geojson){
                    var url = baseurl + '/world/' + $routeParams.portfolio;
                    console.log("Geojson detected");
                }
                if ($.trademarks)
                    var url = baseurl + '/country/' + $routeParams.portfolio + "/" + $location.search().country;
                
                $http.post(url, { marks: $filter('extractCheckedMarks')(marks)})
                    .success(function(res) { console.log(res);$.trademarks = $.geojson = res; });
            };

        }
    }
})
