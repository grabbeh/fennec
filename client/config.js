var angular = require('angular')
var showdown = require('showdown')
var L = require('leaflet')

var app = 
angular.module('app',[
		require('angular-route'), 
		require('angular-animate'),
		require('angular-touch'),
		require('angular-sanitize'),
		require('/vendor/upload.js'),
		require('/vendor/angular-moment.js'),  
		require('/vendor/angles.js'), 
		require('/vendor/modal.min.js'),
		'btford.markdown'])
