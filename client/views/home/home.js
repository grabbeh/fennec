angular.module('app')

.controller('homeCtrl', ['$scope', '$rootScope', 'user', 'notifications', 'notificationService', 'trademarkModal',
    function($scope, $rootScope, user, notifications, notificationService, trademarkModal) {
        var $ = $scope;
        $.portfolios = user.portfolios;
        $.notifications = false || notifications;

        $.showModal = function(trademark) {
            $rootScope.modal = true;
            trademarkModal.deactivate();
            trademarkModal.activate({ trademark: trademark }, { broadcast: true });
        };

        $.deleteNotification = function(notification, index) {
            $.notifications.splice(index, 1);
            notification.read = true;
            notificationService.updateNotification(notification).then(function() {

            });
        };
    }
])
