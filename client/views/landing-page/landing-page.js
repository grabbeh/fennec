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
                    $location.path('/home');
                });
        };

        $.canMessage = function() {
            return $.sendMessageForm.$valid;
        };

        $.sendMessage = function() {
            $http.post('/server/processMessage', { msg: $.msg})
                .success(function() { 
                    notificationModal.activate({ success: "Thank you - we'll be in touch"}, {time: 2})
                });
        };
    }
])
