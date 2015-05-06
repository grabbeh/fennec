angular.module('app')
.directive('classSelector', function($compile, $http, $q, $rootScope, $window, $filter, $templateCache) {
    return {
      scope: {
        data: '=classInfo'
      },
      link: function(scope, element, attrs, ctrl, transclude) {
            
        var $ = scope
        , active = false
        , allClasses = [];
        
        for (var i = 1; i < 46; i++) {
            var o = {};
            o.cl = i;
            allClasses.push(o);
        }

        $.fullClasses = $filter('highlightClasses')($.data, allClasses);
        
        html = $http.get('/views/class-selector/class-selector.html', {
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
                $.data = $filter('extracttmClasses')($.fullClasses);
            }
        
      }
    }
  })
