angular.module('app')

.directive('mgMarkListDisplayer', function() {
    return {
        templateUrl: '/views/mark-list-displayer/mark-list-displayer.html',
        scope: {
            marks: '=',
            sendMarksToServer: '&'
        },
        controller: function($scope, $filter, $http) {
            var $ = $scope;

            $.markServerWrapper = function() {
                var func = $.sendMarksToServer();
                func($.marks);
            }

            $.filterMarks = function(marks) {
                $.markServerWrapper($.marks);
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
                $.markServerWrapper($.marks);
            }

            $.tickAll = function() {
                $filter('tickAll')($.marks);
                $.markServerWrapper($.marks);
            };

        }
    }
})