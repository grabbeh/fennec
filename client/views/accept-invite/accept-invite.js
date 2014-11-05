angular.module('app')
    .controller('acceptInviteCtrl', ['$scope', 'invite', 'notificationModal', 'userService',
    function($scope, invite, notificationModal, userService) {
    var $ = $scope;
    $.invite = invite;

    $.acceptInvite = function() {
        if ($.newUser.password != $.newUser.passwordTwo)
            notificationModal.activate({ error: "Two passwords don't match"})
        else {
              userService.acceptInvite($.newUser)
                .then(function(res) {
                if (!res.error)
                    notificationModal.activate({ success: res.success });
                else
                    notificationModal.activate({error: res.error});
              });
        }
    };
    
    $.canSubmitacceptInvite = function() {
        return $.acceptInviteForm.$valid;
    };
}
])
