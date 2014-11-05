angular.module('app')
    .controller('acceptInviteCtrl', ['$scope', 'invite', 'notificationModal', 'userService', '$routeParams',
    function($scope, invite, notificationModal, userService, $routeParams) {
    var $ = $scope;
    $.invite = invite;

    $.acceptInvite = function() {
        if ($.newUser.password != $.newUser.passwordTwo)
            notificationModal.activate({ error: "Two passwords don't match"})
        else {
              userService.acceptInvite($.newUser, $routeParams.id)
                .then(function(res) {
                if (!res.error)
                    notificationModal.activate({ success: res.success });
                else
                    notificationModal.activate({error: res.error});
              });
        }
    };
    
    $.canSubmitAcceptInvite = function() {
        return $.acceptInviteForm.$valid;
    };
}
])
