angular.module('app')

.controller('uploadCtrl', ['$scope', '$location', 'userService', '$timeout',
    function($scope, $location, userService, $timeout) {
        var $ = $scope;
        $.uploadComplete = function(content) {
            if (content.err) {
                $.response = content.err;
            } else {
                $.response = content.msg;
                $timeout(function() {
                    $location.path('/home');
                }, 1000);
            }
        };

        $scope.loading = function() {
            console.log('loading...');
        };

        $.uploadFormValid = function() {
            return $.uploadForm.$touched && $.uploadForm.$valid;
        };
    }
])
