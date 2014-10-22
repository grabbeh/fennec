angular.module('app')
    .controller('settingsCtrl', ['$scope', 'user', function($scope, user) {
        console.log(user);
        var $ = $scope;
        $.user = user;
        }
    ])
