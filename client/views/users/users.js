angular.module('app')

.controller('usersCtrl', ['$scope', 'users', 'notificationModal', 'userService',
    function($scope, users, notificationModal, userService) {
        var $ = $scope;
        $.users = users;

        $.updateUser = function(user) {
            userService.updateUser(user)
                .then(function() {
                    notificationModal.activate({
                        success: "User updated"
                    });
                });
        };

        $.deleteUser = function(user, index) {
            $.users.splice(index, 1);
            userService.deleteUser(user._id)
                .then(function() {
                    notificationModal.activate({
                        success: "User removed"
                    });
                });
        };

        $.createUser = function() {
            userService.addUser($.newUser)
                .then(function(res) {
                    if (!res.error) {
                        $.users.push(res.user);
                        notificationModal.activate({
                            success: "User added"
                        });

                    } else {
                        notificationModal.activate({
                            error: res.error
                        });
                    }
                });
        };

        $.canSubmitCreateUser = function() {
            return $.createUserForm.$valid;
        };
    }
])
