angular.module('app')

    .controller('trademarkModalCtrl', ['$scope', 'notificationModal', '$rootScope', 'userService', 'trademarkService', '$http', 'editTrademarkModal', 'trademarkModal', 
      function ($scope, notificationModal, $rootScope, userService, trademarkService, $http, editTrademarkModal, trademarkModal) {
      var $ = $scope;
      $.alpha2 = $.trademark.country.alpha2.toLowerCase();
      
      $.closeModal = function() {
        trademarkModal.deactivate();
        $rootScope.modal = false;
      };
          
      $.openEditTrademarkModal = function(trademark){
        userService.isAdmin().then(function(){
                trademarkModal.deactivate();
                editTrademarkModal.activate({trademark: trademark})
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
  