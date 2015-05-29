var angular = require('angular')
var showdown = require('showdown')
var L = require('leaflet')

var app = 
angular.module('app',[
		require('angular-route'), 
		require('angular-animate'),
		require('angular-touch'),
		require('angular-sanitize'),
		require('client/vendor/upload.js'),
		require('client/vendor/angular-moment.js'),  
		require('client/vendor/angles.js'), 
		require('client/vendor/modal.min.js'),
		'btford.markdown'])
