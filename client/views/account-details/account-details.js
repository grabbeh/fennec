angular.module('app')
.directive('mgAccountDetailsWidget', function() {
    return {
        replace: true,
        templateUrl: '/views/account-details/account-details.html',
        scope: {
            user: '='
        },
        controller: function($scope, $http, notificationModal) {
            var $ = $scope;
            $.updatePassword = function(old, nnew, dup) {
                if (nnew != dup) {
                    notificationModal.activate({error: "New password and duplicate don't match"}, {time: 2});
                    return;
                }
                var load = {
                    oldPW: old,
                    newPW: nnew
                };
                $http.post('/api/updatePassword', load)
                    .success(function(data) {
                        notificationModal.activate({ success: data.message }, {time: 2})
                    })
                    .error(function(data) {
                        notificationModal.activate({ error: data.message }, {time: 2})
                    })
            }

        }
    }
})
