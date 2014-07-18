/*
 * @license
 * angular-modal v0.3.0
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */
"use strict";angular.module("btford.modal",[]).factory("btfModal",["$animate","$compile","$rootScope","$controller","$q","$http","$templateCache",function(e,t,n,o,r,a,l){return function(c){function i(e){p.then(function(t){$||u(t,e)})}function u(r,a){if($=angular.element(r),0===$.length)throw new Error("The template contains no elements; you need to wrap text nodes");if(e.enter($,v),d=n.$new(),a)for(var l in a)d[l]=a[l];var c=o(h,{$scope:d});s&&(d[s]=c),t($)(d)}function m(){$&&e.leave($,function(){d.$destroy(),$=null})}function f(){return!!$}if(+!!c.template+ +!!c.templateUrl!==1)throw new Error("Expected modal to have exacly one of either `template` or `templateUrl`");var p,d,h=(c.template,c.controller||angular.noop),s=c.controllerAs,v=angular.element(c.container||document.body),$=null;if(c.template){var g=r.defer();g.resolve(c.template),p=g.promise}else p=a.get(c.templateUrl,{cache:l}).then(function(e){return e.data});return{activate:i,deactivate:m,active:f}}}]);
