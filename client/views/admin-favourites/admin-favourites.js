angular.module('app')
.directive('mgFavouritesPaginator', function() {
    return {
        templateUrl: "/views/admin-favourites/admin-favourites.html",
        replace: true,
        link: function(scope, elements, attrs) {
            var $ = scope;
            $.$watch('favouriteMarks', function(newVal) {
                if (!newVal) {
                    return;
                }
                $.groupOfArrays = [];


                for (var i = 0; i < newVal.length; i += $.itemsPerPage) {
                    var slice = newVal.slice(i, i + $.itemsPerPage);
                    $.groupOfArrays.push(slice);
                }
                $.items = $.groupOfArrays[0];
                $.pageNumber = 1;
            })

            $.$watch('pageNumber', function(newPage) {
                $.items = $.groupOfArrays[newPage - 1];
            })
        },
        scope: {
            favouriteMarks: '=',
            itemsPerPage: '=',
            showModal: '&'
        },
        controller: function($scope) {
            var $ = $scope;
            $.groupOfArrays = [];
            $.prevPage = function(pageNumber) {
                $.pageNumber--;
            };
            $.nextPage = function(pageNumber) {
                $.pageNumber++;
            };
            $.firstPage = function() {
                $.pageNumber = 1;
            };
            $.lastPage = function() {
                $.pageNumber = $scope.groupOfArrays.length;
            };
            $.checkIfFirst = function(pageNumber) {
                if (pageNumber === 1) {
                    return true;
                }
            };
            $.checkIfLast = function(pageNumber) {
                if (pageNumber === $scope.groupOfArrays.length) {
                    return true;
                }
            };
            $.showModalWrapper = function(tm) {
                var func = $scope.showModal();
                func(tm);
            }
        }
    }
})