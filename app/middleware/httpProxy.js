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
		target:'http://bdcsq.zsfdc.gov.cn',
		changeOrigin:true,
		// followRedirects:true,  //跟随重定向 默认false
		ws:true,
		hostRewrite:'localhost:7001',
	}));
	function getIbaseProxy(ctx) {
		return pathToRegexp([
			'/mainWeb/:foo*',
			'pubWeb/:foo*',
			'/cas/:foo*',
			'/formengineWebservice/:foo*',
			'/editorWebService/:foo*',
			'/logsWeb/:foo*',
			'/manager/:foo*',
			'/public/:foo*',
			'/pubWeb/:foo*',
			'/webgisWebService/:foo*',
			'/workflowWebService/:foo*',
		]).exec(ctx.request.url)
		&& !pathToRegexp([
				'/:foo/:foo*.js',
				'/:foo/:foo*.css',
				'/:foo/:foo*.png',
				'/:foo/:foo*.jpg',
			]).exec(ctx.request.url)
	}
	return async function(ctx, next) {
		if(getIbaseProxy(ctx)) {
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
