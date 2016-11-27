angular.module('app')
.controller('passwordCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$location',
    function($scope, $routeParams, $http, $timeout, $location) {
        var $ = $scope;

        $.changePasswordFormValid = function() {
            return $.changePasswordForm.$valid;
        };

        $.changePassword = function() {
            if ($.newPassword !== $.duplicatePassword) {
                $.message = "The two passwords don't match!";
            }
            $http.post('/server/passwordReset/' + $routeParams.id, {
                    newPassword: $.newPassword,
                    duplicatePassword: $.duplicatePassword
                })
                .success(function() {
                    $.message = "Password updated";
                    $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                })
                .error(function() {

                });
        };
    }
])
