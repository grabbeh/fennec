angular.module('app')

.directive('mgMarkListDisplayer', function() {
    return {
        templateUrl: '/views/mark-list-displayer/mark-list-displayer.html',
        scope: {
            listOfMarks: '=',
            trademarks: '='
        },
        controller: function($scope, $filter, $http) {
            var $ = $scope;

            $.filterMarks = function(marks) {
                $.submitMarks($.marks);
            };

            $.toggleMark = function(index) {
                angular.forEach($.marks, function(mark, i) {
                    if (index === i) {
                        mark.checked = !mark.checked;
                    }
                })
                $.markServerWrapper($.marks);
            }

            $.untickAll = function() {
                $filter('untickAll')($.marks);
                $.submitMarks($.marks);
            }

            $.tickAll = function() {
                $filter('tickAll')($.marks);
                $.submitMarks($.marks);
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
