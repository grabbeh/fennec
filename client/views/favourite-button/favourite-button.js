angular.module('app')

.directive('mgFavouriteButton', function() {
    return {
        replace: true,
        templateUrl: '/views/favourite-button/favourite-button.html',
        scope: {
            trademark: '=',
            user: '='
        },
        link: function(scope, elem, attrs){
        },
        controller: function($scope, userService) {
            var $ = $scope;
            $.toggleFavourite = function() {
                if ($.trademark.favourite) {
                    $.trademark.favourite = false;
                    $.user.favourites.forEach(function(fav, i) {
                        if (fav === $.trademark._id) 
                            $.user.favourites.splice(i, 1);
                    })
                    userService.updateUser($.user).then(function(res) {});

                } else {
                    $.trademark.favourite = true;
                    $.user.favourites.push($.trademark._id)
                    userService.updateUser($.user).then(function(res) {})
                }
            }
        }
    }
})
