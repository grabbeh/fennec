angular.module('app')

    .controller('editTrademarkModalCtrl', ['$scope', '$filter', 'notificationModal', '$rootScope', '$http', 'trademarkService', 'editTrademarkModal',
      function ($scope, $filter, notificationModal, $rootScope, $http, trademarkService, editTrademarkModal) {
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
                    notificationModal.activate({ success: data.message }, { time: 2});
                    editTrademarkModal.deactivate();
                });
            }
    }])
