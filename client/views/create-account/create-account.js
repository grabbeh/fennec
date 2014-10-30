angular.module('app')

.controller('createAccountCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        var $ = $scope;
        $.createUser = function() {
            $http.post('/api/createAccount', $.newUser)
                .success(function() {
                    $location.path('/');
                })
                .error(function(data) {
                    $.message = data.message;
                });
        };

        $.canSubmitCreateUser = function() {
            return $.createUserForm.$touched && $.createUserForm.$valid;
        };

    }
])
