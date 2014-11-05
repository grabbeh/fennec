angular.module('app')
    .controller('acceptInviteCtrl', ['$scope', '$rootScope', '$location', '$window', 'invite', 'notificationModal', 'userService', '$routeParams',
    function($scope, $rootScope, $location, $window, invite, notificationModal, userService, $routeParams) {
    var $ = $scope;
    $.invite = invite;

    $.acceptInvite = function() {
        if ($.newUser.password != $.newUser.passwordTwo)
            notificationModal.activate({ error: "Two passwords don't match"})
        else {
              userService.acceptInvite($.newUser, $routeParams.id)
                .then(function(res) {

                if (!res.error){
                    notificationModal.activate({ success: "Congratulations, you've successfully created an account" });
                    $window.sessionStorage.token = res.token;
                    $rootScope.user = true;
                    $location.path('/home');
                }
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
