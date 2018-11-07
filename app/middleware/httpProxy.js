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
		// target:'http://bdcsq.zsfdc.gov.cn',
		target:'http://192.168.10.95:8080',
		changeOrigin:true,
		// followRedirects:true,  //跟随重定向 默认false
		ws:true,
		hostRewrite:'localhost:7001',
	}));
	function getIbaseProxy(ctx) {
		/**
		 * 是否代理静态资源，
		 *  若真  则代理（不会请求本地的静态资源）
		 *  若假  则不代理（会出现404、除非你本地做了静态资源映射）
		 * @param boolean 默认不代理静态资源
		 */
		function isProxyStatic(boolean = false) {
			if(boolean)
				return boolean
			return !pathToRegexp([
					'/:foo/:foo*.js',
					'/:foo/:foo*.css',
					'/:foo/:foo*.png',
					'/:foo/:foo*.jpg',
		]).exec(ctx.request.url)
		}
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
		&& isProxyStatic()
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
