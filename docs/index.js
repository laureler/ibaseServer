var path = require('path');
const pathToRegexp = require('path-to-regexp');

console.log(pathToRegexp([
	"/public/:demo*"
]).exec('/public/vue/styles/sgui_bsc.css'));


console.log(path.join(__dirname, '../','src'));
console.log(path.join(__dirname, '..','src'));
console.log(path.join(__dirname, 'src'));