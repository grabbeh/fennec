angular.module('app')

.controller('landingPageCtrl', ['$scope', '$window', '$http', 'notificationModal', 'userService', '$location', '$rootScope',
    function($scope, $window, $http, notificationModal, userService, $location, $rootScope) {
        var $ = $scope;
        $.loadDemo = function() {
            userService.logIn({
                    password: "demo",
                    email: "demo@demo.com"
                })
                .then(function(res) {
                    $window.sessionStorage.token = res.data.token;
                    $rootScope.isUser = true;

                    $location.path('/home');
                }, function(err){

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
