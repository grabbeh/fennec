angular.module('app')

.controller('homeCtrl', ['$scope', '$rootScope', 'user', 'notifications', 'notificationService', 'trademarkModal',
    function($scope, $rootScope, user, notifications, notificationService, trademarkModal) {
        var $ = $scope;
        $.portfolios = user.portfolios;
        if (notifications.length === 0) {
            $.notifications = false;
        } else {
            $.notifications = notifications;
        }
        $.showModal = function(trademark) {
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({
                trademark: trademark,
                user: user
            });
        };

        $.deleteNotification = function(notification, index) {
            $.notifications.splice(index, 1);
            notification.read = true;
            notificationService.updateNotification(notification).then(function() {

            });
        };
    }
])
