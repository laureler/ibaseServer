const pathToRegexp = require('path-to-regexp');
console.log(pathToRegexp(/comprehensiveMonitorWebService\/*/).exec('http://localhost:8080/comprehensiveMonitorWebService/purchase/purchaseDetail'));