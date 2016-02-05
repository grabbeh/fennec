angular.module('app')
.directive('mgAdminFavourites', function() {
    return {
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        scope: {
            items: '=',
            user: '='
        },
        controller: function($scope, trademarkModal) {
            var $ = $scope;
            $.user = user;
            console.log(user);
            console.log($.user);
            $.showModal = function(trademark) {
                console.log($.user);
                trademarkModal.deactivate();
                trademarkModal.activate({ trademark: trademark, user: $.user }, { broadcast: true })
            }
        }
    }
})
