//
exports.httpProxy = {
	//默认配置代理了 95服务器
	proxy_0: {
		proxyConfig: {
			target: 'http://192.168.10.97:8090',
			changeOrigin: true,
			// followRedirects:true,  //跟随重定向 默认false
			ws: true,
			hostRewrite: 'localhost:7001',
		},
		proxyRules: [
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
		],
		//是否代理静态资源
		isProxyStatic: true,
	},
	proxy_1: {
		proxyConfig: {
			// target:'http://bdcsq.zsfdc.gov.cn',
			target: 'http://172.16.42.126:8080',
			changeOrigin: true,
			// followRedirects:true,  //跟随重定向 默认false
			ws: true,
			hostRewrite: 'localhost:7001',
		},
		proxyRules: [
			"/comprehensiveMonitorWebService/:foo*"
		],
		//是否代理静态资源
		isProxyStatic: true,
	},
	proxy_2: {
		proxyConfig: {
			// target:'http://bdcsq.zsfdc.gov.cn',
			target: 'http://localhost:8080',
			changeOrigin: true,
			// followRedirects:true,  //跟随重定向 默认false
			ws: true,
			hostRewrite: 'localhost:7001',
		},
		proxyRules: [

		],
		//是否代理静态资源
		isProxyStatic: true,
	},
}
