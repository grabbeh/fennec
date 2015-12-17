angular.module('app')
.directive('trademarkAutocomplete', function($compile, $http, $window, $templateCache) {
    return {
      scope: {
        trademark: '=trademark'
      },
      link: function(scope, element, attrs, ctrl, transclude) {
            
        var $ = scope
        , active = false
        
        console.log($.trademark);
        $.potentialMarks = $http.get('/api/list/' + trademark.portfolio + "'").then(function(response){ console.log(response.data);return response.data; })
        
        html = $http.get('/views/trademark-autocomplete/trademark-autocomplete.html', {
          cache: $templateCache
        }).then(function (response) {
          return response.data;
        });
        
        var addContent = function(ev) {
          ev.stopPropagation();
          if (!active) {
            html.then(function(html){
                ht = angular.element(html);
                content = $compile(ht)(scope)
                element.append(content);
                active = true;
                ht.on('click', function(ev){
                  ev.stopPropagation();
                })
            })
          }
          else {
            ht.remove();
            active = false
          }
        }
        
        element.children().bind('click', addContent);

        $.selectName = function(m) { $.trademark.mark = m; }
        
        angular.element($window).on('click', function(){
           if (active){
             ht.remove();
             active = false;
           }
        })

      }
    }
  })
