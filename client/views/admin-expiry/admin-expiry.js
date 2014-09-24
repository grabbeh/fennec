angular.module('app')
.directive('mgAdminExpiry', function() {
    return {
        templateUrl: "/views/admin-expiry/admin-expiry.html",
        replace: true,
        scope: {
            paginatedMarks: '=',
            items: '=',
            showModal: '&'
        },
         controller: function($scope) {
            var $ = $scope;
            $.innerShowModal = function(tm) {
                var func = $.showModal();
                func(tm);
            }
        }
    }
})