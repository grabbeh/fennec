angular.module('app')

.directive('mgTrademarkComments', function() {
    return {
        scope: {
            trademark: '=',
            itemsPerPage: '=',
            user: '='
        },
        replace: true,
        templateUrl: '/views/trademark-comments/trademark-comments.html',
        controller: function($scope, trademarkService, notificationModal, notificationService) {
            var $ = $scope;

            $.addComment = function(text) {
                var comment = {};
                comment.text = text;
                comment.date = new Date();
                comment.author = $.user._id;
                if ($.trademark.comments === undefined) {
                    $.trademark.comments = [];
                }
                $.trademark.comments.push(comment);
                trademarkService.editMark($.trademark).then(function(res) {
                    $.text = "";
                })
            }

            $.startEdit = function(comment, index) {
                if (comment.author != $.user._id) {
                    notificationModal.activate({
                        error: "Only author can edit"
                    })
                    return;
                }
                $.comment = comment;
                $.index = index;
                $.text = comment.text;
                $.showEditButton = true;

            }

            $.editComment = function(text) {
                $.trademark.comments[$.index].text = text;
                $.trademark.comments[$.index].updated = new Date();
                trademarkService.editMark($.trademark).then(function(res) {
                    notificationModal.activate({
                        success: "Comment edited"
                    });
                    $.showEditButton = false;
                    $.text = "";
                });;
            }

            $.deleteComment = function(comment, index) {
                if (comment.author != $.user._id) {
                    notificationModal.activate({
                        error: "Only author can delete"
                    })
                    return;
                }
                $.trademark.comments.splice(index, 1);
                trademarkService.editMark($.trademark).then(function(res) {
                    notificationModal.activate({
                        success: "Comment deleted"
                    });

                })
            }


        }
    }
})