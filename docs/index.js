const pathToRegexp = require('path-to-regexp');
console.log(pathToRegexp([
	"/comprehensiveMonitorWebService/:demo*"
]).exec('/comprehensiveMonitorWebService/purchase/purchaseDetail'));