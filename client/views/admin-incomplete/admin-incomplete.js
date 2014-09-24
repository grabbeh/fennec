angular.module('app')
.directive('mgAdminIncomplete', function() {
    return {
        templateUrl: "/views/admin-incomplete/admin-incomplete.html",
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