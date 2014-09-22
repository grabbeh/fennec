angular.module('app')

.directive('mgSwipe', function($swipe) {
    return {
        link: function(scope, element, attrs) {
            $swipe.bind(element, {
                'start': function(coords) {
                    console.log("Start")
                    console.log(coords)

                },
                'move': function(coords) {
                    //console.log("Move");
                    //console.log(coords);
                    element.addClass("active-swipe")
                },
                'end': function(coords) {
                    console.log("End");
                    console.log(coords);
                    element.removeClass("active-swipe")
                }
            })
        }
    }
})


.directive('mgMenuMover', function() {
    return {
        scope: {
            menuModal: '=',
            dropdownMenu: '='
        },
        link: function(scope, element, attrs) {
            scope.$watch(attrs.menuModal, function(v) {
                if (v) {
                    element.addClass('active-menu')
                } else {
                    element.removeClass('active-menu')
                }
            })

        }
    }
})


.directive('mgClear', function() {
    return {
        compile: function(element) {
            element.addClass('clear')
        }
    };
})

.directive('mgBold', function() {
    return {
        compile: function(element) {
            element.addClass('bold')
        }
    };
})


.directive('tabs', function() {
    return {
        transclude: true,
        scope: {},
        controller: function($scope, $element) {
            var panes = $scope.panes = [];

            $scope.select = function(pane) {
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }

            this.addPane = function(pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        template: '<div class="tabbable">' +
            '<ul class="tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{activepane:pane.selected}">' +
            '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
            '</ul>' +
            '<div class="tab-content" ng-transclude></div>' +
            '</div>',
        replace: true
    };
})

.directive('pane', function() {
    return {
        require: '^tabs',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="tab-pane" ng-class="{ activetab: selected}" ng-transclude>' +
            '</div>',
        replace: true
    };
})

