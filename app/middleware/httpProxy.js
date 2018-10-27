//  app/middleware/httpProxy.js
const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const pathToRegexp = require('path-to-regexp');

module.exports = (options) => {
	const test0Proxy = k2c(httpProxy({
		target: 'http://test1.com',
		changeOrigin: true,
	}));

	const test2Proxy = k2c(httpProxy({
		target: 'http://test1.com',
		changeOrigin: true,
	}));
	const ibaseProxy = k2c(httpProxy({
		target:'http://192.168.10.95:8080',
		changeOrigin:true,
		// followRedirects:true,  //跟随重定向 默认false
		ws:true,
		hostRewrite:'localhost:7001',
	}));
	return async function(ctx, next) {
		if(pathToRegexp([
			'/mainWeb/*',
			'pubWeb/*',
			'/cas/*',
			'/formengineWebservice/*',
			'/editorWebService/*',
			'/formengindWebService/*',
			'/logsWeb/*',
			'/manager/*',
			'/public/*',
			'/pubWeb/*',
			'/webgisWebService/*',
			'/workflowWebService/*',
		]).exec(ctx.request.url)) {
			ibaseProxy(ctx, next);
		}
		else if (pathToRegexp(/asd\/v1/).exec(ctx.request.url)) {
			test1Proxy(ctx, next);
		} else if (pathToRegexp(/asd\/v1/).exec(ctx.request.url)) {
			test2Proxy(ctx, next);
		} {
			await next();
		}
	};
};
