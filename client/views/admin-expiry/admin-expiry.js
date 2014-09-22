angular.module('app')
.directive('mgPaginator', function() {
    return {
        templateUrl: "/views/admin-expiry/admin-expiry.html",
        replace: true,
        link: function(scope, elements, attrs) {
            var $ = scope;
            $.$watch(attrs.sortedByExpiry, function(newVal) {
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
            sortedByExpiry: '=',
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
                $.pageNumber = $.groupOfArrays.length;
            };
            $.checkIfFirst = function(pageNumber) {
                if (pageNumber === 1) {
                    return true;
                }
            };
            $.checkIfLast = function(pageNumber) {
                if (pageNumber === $.groupOfArrays.length) {
                    return true;
                }
            };
            $.showModalWrapper = function(tm) {
                var func = $.showModal();
                func(tm);
            }
        }
    }
})