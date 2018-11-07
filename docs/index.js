const pathToRegexp = require('path-to-regexp');
console.log(!pathToRegexp([
	'/:foo/:foo*.js',
	'/:foo/:foo*.css',
	'/:foo/:foo*.png',
	'/:foo/:foo*.jpg',
]).exec('localhopubweb/index.js'));