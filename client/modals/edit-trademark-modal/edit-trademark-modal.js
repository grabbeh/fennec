angular.module('app')

    .controller('editTrademarkModalCtrl', ['$scope', 'notificationModal', '$rootScope', '$http', 'trademarkService', 'editTrademarkModal',
      function ($scope, notificationModal, $rootScope, $http, trademarkService, editTrademarkModal) {
          var $ = $scope;
          $.closeModal = function() {
            editTrademarkModal.deactivate();
            $rootScope.modal = false;
          };
    
          $.statuses = ["Registered", "Published", "Pending"];

        $http.get('/api/countryData')
            .success(function(data){
                $.countrydata = data;
            })
    
        $.editTrademark = function(trademark){
            trademarkService.editMark(trademark)
                .success(function(data){
                    notificationModal.activate({ success: data.message });
                    editTrademarkModal.deactivate();
                });
            }
    }])
