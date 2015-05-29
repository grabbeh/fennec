var angular = require('angular')
var Showdown = require('showdown')
var L = require('leaflet')
var Chart = require('./client/vendor/Chart.min')


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
