//  app/middleware/httpProxy.js
const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const pathToRegexp = require('path-to-regexp');

module.exports = (options) => {
	const test0Proxy = k2c(httpProxy({
		target: 'http://test1.com',
		changeOrigin: true,
	}));

	const comprehensiveMonitorProxy = k2c(httpProxy({
		// target:'http://bdcsq.zsfdc.gov.cn',
		target:'http://localhost:8080',
		changeOrigin:true,
		// followRedirects:true,  //跟随重定向 默认false
		ws:true,
		hostRewrite:'localhost:7001',
	}));
	const ibaseProxy = k2c(httpProxy({
		target:'http://192.168.10.95:8080',
		changeOrigin:true,
		// followRedirects:true,  //跟随重定向 默认false
		ws:true,
		hostRewrite:'localhost:7001',
	}));
	/**
	 * 是否代理静态资源，
	 *  若真  则代理（不会请求本地的静态资源）
	 *  若假  则不代理（会出现404、除非你本地做了静态资源映射）
	 * @param boolean 默认不代理静态资源
	 */
	function isProxyStatic(boolean = false,url) {
		if(boolean){
			return boolean
		}
		return !pathToRegexp([
			'/:foo/:foo*.js',
			'/:foo/:foo*.css',
			'/:foo/:foo*.png',
			'/:foo/:foo*.jpg',
			'/:foo/:foo*.ttf',
			'/:foo/:foo*.woff',
		]).exec(url)
	}
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
		&& isProxyStatic(ctx.request.url)
	}

	/**
	 * 代理 综合监管项目
	 * @param ctx
	 * @returns {RegExpExecArray | boolean}
	 */
	function getComprehensiveProxy(ctx){
		return pathToRegexp([
				'/comprehensiveMonitorWebService/:foo*',
			]).exec(ctx.request.url)
			&& isProxyStatic(true,ctx.request.url)
	}
	return async function(ctx, next) {
		if (getComprehensiveProxy(ctx)) {
			comprehensiveMonitorProxy(ctx, next);
		}

		else if (pathToRegexp(/asd\/v1/).exec(ctx.request.url)) {
			test1Proxy(ctx, next);
		} else if(getIbaseProxy(ctx)) {
			ibaseProxy(ctx, next);
		}
		{
			await next();
		}
	};
};
