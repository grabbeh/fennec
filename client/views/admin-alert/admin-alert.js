angular.module('app')
.directive('mgAdminAlertWidget', function(userService) {
    return {
        replace: true,
        templateUrl: '/views/admin-alert/admin-alert.html',
        scope: {
            user: '='
        },
        link: function($scope) {
            var $ = $scope;
            $.$watch('user.alertFrequency', function(frequency) {
                if (!frequency) {
                    return;
                }
                $.user.alertOptions.forEach(function(option, i) {
                    if (option.functionName === "sendExpiryAlerts") {
                        if (frequency.length > 0) {
                            $.user.alertOptions[i].checked = true;
                        } else {
                            $.user.alertOptions[i].checked = false;
                        }
                    }
                })
            })
        },
        controller: function($scope, $http, notificationModal) {
            var $ = $scope;

            $.alert = {};
            $.alert.number = "";
            $.alert.type = "";
            $.number = "";
            $.types = ["days", "weeks", "months", "years"];

            $.removeAlert = function(index) {
                $.user.alertFrequency.splice(index, 1);
                $.updateAlerts($.user);
            }

            $.addAlert = function(alert) {
                if (alert.number === "") {
                    $.message = "Please provide a number";
                    $.alert.type = "";
                    return;
                }
                $.user.alertFrequency.push({
                    type: alert.type,
                    number: alert.number
                });
                $.updateAlerts($.user);
                $.number = "";
                $.message = "";
            }

            $.updateAlerts = function(user) {
                userService.updateUser(user)
                    .then(function(data) {
                        notificationModal.activate({
                            success: "Alerts updated"
                        })
                        $.alert.type = "";
                        $.alert.number = "";
                        $.user = data;
                    })
            }

        }
    }
})
