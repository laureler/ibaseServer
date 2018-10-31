const pathToRegexp = require('path-to-regexp');
var testurl ='/public/api/cakeyApi.min.js'
function getIbaseProxy(testurl) {
	return pathToRegexp([
			'/mainWeb/:foo*',
			'pubWeb/:foo*',
			'/cas/:foo*',
			'/formengineWebservice/:foo*',
			'/editorWebService/:foo*',
			'/formengindWebService/:foo*',
			'/logsWeb/:foo*',
			'/manager/:foo*',
			'/public/:foo*',
			'/pubWeb/:foo*',
			'/webgisWebService/:foo*',
			'/workflowWebService/:foo*',
		]).exec(testurl)
		&& !pathToRegexp([
			'/:foo/:foo*.js',
			'/cas/:foo*.min.js',
			'/cas/:foo*.css',
		]).exec(testurl)
}

console.log(getIbaseProxy(testurl));