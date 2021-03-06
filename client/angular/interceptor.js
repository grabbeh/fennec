angular.module('app')
	.factory('authInterceptor', function ($q, $window) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($window.sessionStorage.token) {
               config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {

          }
          return response || $q.when(response);
        }
      };
  })

  .config(function ($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
  });