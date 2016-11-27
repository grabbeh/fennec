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
                $.editIndex = index;
                $.text = comment.text;
                $.showEditButton = true;
            }
            
            $.cancelEdit = function(){
                $.showEditButton = false;
                $.text = "";
            }

            $.editComment = function(text) {
                $.trademark.comments[$.editIndex].text = text;
                $.trademark.comments[$.editIndex].updated = new Date();
                trademarkService.editMark($.trademark).then(function(res) {
                    notificationModal.activate({ success: "Comment edited" }, {time: 2});
                    $.showEditButton = false;
                    $.text = "";
                });
            }

            $.deleteComment = function(comment, index) {
                if (comment.author != $.user._id) {
                    notificationModal.activate({ error: "Only author can delete" }, {time: 2});
                    return;
                }
                $.trademark.comments.splice(index, 1);
                trademarkService.editMark($.trademark).then(function(res) {
                    notificationModal.activate({ success: "Comment deleted" }, {time: 2});
                })
            }
        }
    }
})
