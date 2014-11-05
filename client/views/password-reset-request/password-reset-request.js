angular.module('app')
.controller('passwordResetCtrl', ['$scope', 'notificationModal', '$http',
    function($scope, notificationModal, $http) {
    var $ = $scope;
    
    $.passwordResetFormValid = function() {
        return $.passwordResetForm.$valid;
    };
    
    $.requestPasswordReset = function() {
        $http.post('/server/requestPasswordReset', { email: $.email })
            .success(function(res) {
                notificationModal.activate({ success: res.success });
            });
        };
    }
])
