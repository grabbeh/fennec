var angular = require('angular');
var showdown = require('showdown');

var app = 
angular.module('app',[
		require('angular-route'), 
		require('angular-animate'),
		require('angular-touch'),
		require('angular-sanitize'),
		'ngFileUpload',
		'angular-momentjs',  
		'angles', 
		'btford.modal',
		'btford.markdown']);
