angular.module('app')

.directive('mgMarkListDisplayer', function() {
    return {
        templateUrl: '/views/mark-list-displayer/mark-list-displayer.html',
        scope: {
            listOfMarks: '=',
            trademarks: '='
        },
        controller: function($scope, $filter, $http, $routeParams, $location) {
            var $ = $scope;
            console.log($scope);

            $.filterMarks = function() {
                $.submitMarks($.listOfMarks);
            };

            $.toggleMark = function(index) {
                angular.forEach($.listOfMarks, function(mark, i) {
                    if (index === i) {
                        mark.checked = !mark.checked;
                    }
                })
                $.markServerWrapper($.listOfMarks);
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
                $http.post('/api/country/' + $routeParams.portfolio + "/" + $location.search().country, {
                        marks: $filter('extractCheckedMarks')(marks)
                    }).success(function(trademarks) {
                        $.trademarks = trademarks;
                    });
            };

        }
    }
})
