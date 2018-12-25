/**
 * path regx
 * @type {module:path}
 */
var path = require('path');
const pathToRegexp = require('path-to-regexp');

console.log(pathToRegexp([
	"/public/:demo*","/mainWeb/index/1"
]).exec('mainWeb/index/1'));
