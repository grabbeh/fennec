angular.module('app')

    .controller('trademarkModalCtrl', ['$scope', '$filter', '$window', 'notificationModal', '$rootScope', 'userService', 'trademarkService', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, $filter, $window, notificationModal, $rootScope, userService, trademarkService, editTrademarkModal, trademarkModal) {
      var $ = $scope;
      $.alpha2 = $.trademark.country.alpha2.toLowerCase();
      
      $.closeModal = function() {
        trademarkModal.deactivate();
        $rootScope.modal = false;
      };
          
      $.openEditTrademarkModal = function(trademark){
        userService.isAdmin().then(function(){
                trademarkModal.deactivate();
                editTrademarkModal.activate({trademark: trademark});
                $window.scrollTo(0, 0);
            }, function(res){
                notificationModal.activate({ error: res.data.message});
            })
          }
    
      $.deleteTrademark = function(trademark){
        userService.isAdmin().then(function(res){
            trademarkService.deleteMark(trademark)
               .success(function(data){
                    notificationModal.activate({ success: data.message })
               })
            }, function(res){
                notificationModal.activate({error: res.data.message });
            })
        }
    }])
  
