angular.module('app')
.directive('mgGroupSelector', function() {
    return {
        replace: true,
        templateUrl: '/views/group-selector/group-selector.html',
        scope: {
            marks: '=',
            goToGroup: '&',
            title: '@'
        },
        controller: function($scope) {
            var $ = $scope;
            $.goToGroupWrapper = function(obj) {
                var func = $.goToGroup();
                func(obj);
            }
        }
    }
})