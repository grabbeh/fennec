var angular = require('angular')
//var Showdown = require('showdown')
var L = require('leaflet')
//var rome = require('rome')

var app = 
angular.module('app',[
		require('angular-route'), 
 		require('angular-animate'),
 		require('angular-touch'),
		require('angular-sanitize'),
 		require('./vendor/upload.js'),
 		//'ngFileUpload',
 		'angular-momentjs',  
 		'angles', 
 		'btford.modal',
 		'btford.markdown']);
