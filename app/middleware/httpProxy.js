//  app/middleware/httpProxy.js
const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const pathToRegexp = require('path-to-regexp');

module.exports = (options, app) => {
	var k2c0 = k2c(httpProxy(options.proxy_0.proxyConfig));
	var k2c1 = k2c(httpProxy(options.proxy_1.proxyConfig));
	var k2c2 = k2c(httpProxy(options.proxy_2.proxyConfig));

	/**
	 *
	 * @param proxyRules    过滤拦截规则（例如 "/mainWeb/*" 就只会有 /mainWeb/开头的地址被过滤留下来
	 * @param isProxyStatic    是否使用HTTP代理静态资源？ 如果不愿意使用HTTP代理静态资源，那么会自动代理本地的静态资源（否则就会出现404文件找不到的情况）
	 * isProxyStatic 默认是true 代理服务器的文件
	 * @param ctx 全局配置对象
	 */
	function matchProxyRule(proxyRules, isProxyStatic = true, ctx) {
		/**
		 * 是否代理静态资源，
		 *  若真  则代理（不会请求本地的静态资源）
		 *  若假  则不代理（会出现404、除非你本地做了静态资源映射）
		 * @param boolean 默认不代理静态资源
		 */
	function ProxyStatic(boolean, url) {
			if (boolean === true) {
				return true;
			} else if (pathToRegexp([
				'/:foo/:foo*.js',
				'/:foo/:foo*.css',
				'/:foo/:foo*.png',
				'/:foo/:foo*.jpg',
				'/:foo/:foo*.ttf',
				'/:foo/:foo*.woff',
			]).exec(url) == undefined) {
				return true
			}
		}
		var regExpExecArray =  pathToRegexp(proxyRules).exec(ctx.request.url) == undefined?false:true;
		let proxyStatic = ProxyStatic(isProxyStatic, ctx.request.url);
		var proxyServerStatus = regExpExecArray == undefined?'失败':'成功'
		var proxyStaticStatus = proxyStatic == undefined?'失败':'成功'
		return regExpExecArray
			&& proxyStatic
	}

	return async function (ctx, next) {
		//如果符合 proxy_0 就通过proxy_0来代理
		// if (matchProxyRule(options.proxy_0.proxyRules, options.proxy_0.isProxyStatic, ctx)) {
		if (matchProxyRule(options.proxy_0.proxyRules, options.proxy_0.isProxyStatic, ctx)) {
			k2c0(ctx,next)
		}
		else if (matchProxyRule(options.proxy_1.proxyRules, options.proxy_1.isProxyStatic, ctx)) {
			k2c1(ctx, next);
		}
		else if (matchProxyRule(options.proxy_2.proxyRules, options.proxy_2.isProxyStatic, ctx)) {
			console.log("代理 middleWare")
			k2c2(ctx, next);
		}
		{
			await next();
		}
	}
}