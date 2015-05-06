angular.module('app')
.directive('classSelector', function($compile, $http, $q, $rootScope, $window, $filter, $templateCache) {
    return {
      scope: {
        data: '='
      },
      link: function(scope, element, attrs, ctrl, transclude) {

        var $ = scope
        , active = false
        , allClasses = [{cl: 1},{cl: 2}, {cl:3},{cl: 4}, {cl: 5},{cl: 6}, {cl: 7}, {cl: 8}, {cl: 9}, { cl: 10}];
        $.fullClasses = $filter('highlightClasses')($.data, allClasses);
        
        html = $http.get('template.html', {
          cache: $templateCache
        }).then(function (response) {
          return response.data;
        });
        
        var addContent = function() {
          if (!active) {
            html.then(function(html){
                ht = angular.element(html);
                content = $compile(ht)(scope)
                element.append(content);
                active = true;
            })
          }
          else {
            ht.remove();
            active = false
          }
        }
        
        element.children().bind('click', addContent);

        $.toggleClass = function(index) {
                angular.forEach($.fullClasses, function(c, i) {
                    if (index === i) {
                        c.checked = !c.checked;
                    }
                })
                $.data = $filter('extractClasses')($.fullClasses);
            }
        
      }
    }
  })
