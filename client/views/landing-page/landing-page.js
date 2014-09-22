angular.module('app')

.controller('landingPageCtrl', ['$scope', '$window', '$http', 'userService', '$location', '$rootScope',
    function($scope, $window, $http, userService, $location, $rootScope) {
        var $ = $scope;
        $.loadDemo = function() {
            userService.logIn({
                    password: "demo",
                    email: "demo@demo.com"
                })
                .then(function(res) {
                    $window.sessionStorage.token = res.data.token;
                    $rootScope.user = true;
                    $location.path('/home/ACME INC');
                });
        };

        $.canMessage = function() {
            return $.sendMessageForm.$dirty && $.sendMessageForm.$valid;
        };

        $.sendMessage = function() {
            $http.post('/server/processMessage', {
                    msg: $.msg
                })
                .success(function(response) {
                    $.message = response.msg;
                });
        };
    }
])