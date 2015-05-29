var angular = require('angular')
var showdown = require('showdown')
var L = require('leaflet')
var Modernizr = require('modernizr')

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
