angular.module('app')
.directive('trademarkAutocomplete', function($compile, $http, $window, $templateCache, $routeParams) {
    return {
      scope: {
        trademark: '=trademark'
      },
      link: function(scope, element, attrs, ctrl, transclude) {
            
        var $ = scope
        , active = false
        var portfolio = $routeParams.portfolio;
        //var url = '"' + '/api/list/' + portfolio + '"';
        //console.log(url);
        $http.get('/api/list/' + portfolio).then(function(response){ $.potentialMarks = response.data; console.log($.potentialMarks)});
    
        template = $http.get('/views/trademark-autocomplete/trademark-autocomplete.html', { cache: $templateCache })
          .then(function (response) { return response.data; });

        var addContent = function(ev) {
          ev.stopPropagation();
          if (!active) {
            template.then(function(template){
                ht = angular.element(template);
                content = $compile(ht)(scope)
                element.append(content);
                active = true;
                ht.on('click', function(ev){ ev.stopPropagation(); })
            })
          }
          else {
            ht.remove();
            active = false
          }
        }
        
        element.children().bind('click', addContent);

        $.selectName = function(m) { 
            $.trademark.mark = m; 
            ht.remove(); 
        }
        
        angular.element($window).on('click', function(){
           if (active){
             ht.remove();
             active = false;
           }
        })

      }
    }
  })
