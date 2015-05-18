angular.module('app')

.controller('usersCtrl', ['$scope', 'users', 'notificationModal', 'userService',
    function($scope, users, notificationModal, userService) {
        var $ = $scope;
        $.users = users;

        $.updateUser = function(user) {
            userService.updateUser(user)
                .then(function() {
                    notificationModal.activate({ success: "User updated" }, { time: 2 });
                });
        };

        $.deleteUser = function(user, index) {
            $.users.splice(index, 1);
            userService.deleteUser(user._id)
                .then(function() {
                    notificationModal.activate({ success: "User removed" }, {time: 2});
                });
        };

        $.sendInvite = function() {
            userService.sendInvite($.newUser)
                .then(function(res) {
                    if (!res.error) 
                        notificationModal.activate({ success: res.success }, {time: 2});
                    else 
                        notificationModal.activate({error: res.error}, { time: 2});
                });
        };

        $.canSubmitSendInvite = function() {
            return $.sendInviteForm.$valid;
        };
    }
])
