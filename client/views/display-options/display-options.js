angular.module('app')
.directive('mgDisplayOptions', function(userService) {
    return {
        replace: true,
        templateUrl: '/views/display-options/display-options.html',
        scope: {
            user: '='
        },
        link: function($scope) {

        },
        controller: function($scope, notificationModal) {
            var $ = $scope;

            $.updateUser = function(user) {
                console.log(user);
                userService.updateUser(user)
                    .then(function(data) {
                        notificationModal.activate({
                            success: "Display options updated"
                        }, 2)
                    })
            }

        }
    }
})
