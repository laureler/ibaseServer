const path = require('path');
const fs = require('fs');
module.exports = app => {
	// let exports = {};
	const config = exports = {};
	exports.siteFile = {
		'/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/asset/images/favicon.ico'))
	};

	//如果需要配置ibase项目 添加ibase项目的基本地址 例如： d://ibase2.0  其中ibase2.0内部应当有两个文件(.gitignore、readme.md)一个文件夹(wimushroom)
	var ibaseDir = "C://dev/projects/ibase_sprint004"

	// 如果有配置没有加上，可以在此提交代码，prefix为根路径后面的相对路径（localhost:8080/mainWeb/index/1 --->你只需要写/mainWeb就可以了，所有的mainWeb后面的都会给你配置上去。）、dir为你的静态资源相对路径
	exports.multipleStatic = [
		{
			prefix: '/cas',
			dir: path.join(ibaseDir, '/wimushroom/源码/cas/casWebService/src/main/webapp')
		},
		//奇怪的映射 不应该存在的
		{
			prefix: '/cas/images',
			dir: path.join(ibaseDir, '/wimushroom/源码/cas/casWebService/src/main/webapp/img')
		},
		// mainWeb可能会有一些图片找不到，放心，是做了映射正确的，检查下在文件夹里面有没有图片o(╯□╰)o
		{
			prefix: '/mainWeb',
			dir: path.join(ibaseDir, '/wimushroom/源码/main/mainWeb/src/main/webapp'),
		},
		//奇怪的映射 不应该存在的
		{
			prefix: '/mainWeb/images',
			dir: path.join(ibaseDir, '/wimushroom/源码/main/mainWeb/src/main/webapp/img'),
		},
		// 映射pubWeb模块
		{
			prefix: '/pubWeb',
			dir: path.join(ibaseDir, '/wimushroom/源码/main/pubWeb/src/main/webapp'),
		},
		// 映射editorWebService模块
		{
			prefix: '/editorWebService',
			dir: path.join(ibaseDir, '/wimushroom/源码/workflow/editorWebService/src/main/webapp'),
		},
		{
			prefix: '/formengineWebService',
			dir: path.join(ibaseDir, '/wimushroom/源码/formengine/formengineWebservice/src/main/webapp'),
		},
		{
			prefix: '/workflowWebService',
			dir: path.join(ibaseDir, '/wimushroom/源码/workflow/workflowWebService/src/main/webapp'),
		},
		{
			prefix: '/webgisWebService',
			dir: path.join(ibaseDir, '/wimushroom/源码/webgis/webgisWebService/src/main/webapp'),
		},
		{
			prefix: '/customModuleWebService',
			dir: path.join(ibaseDir, '/wimushroom/源码/custom/customModuleWebService/src/main/webapp'),
		},
		{
			prefix: '/public',
			dir: path.join(ibaseDir, '/wimushroom/源码/public'),
		}
	]

	exports.view = {
		cache: false
	};

	exports.vuessr = {
		layout: path.join(app.baseDir, 'app/web/view/layout.html'),
		renderOptions: {
			// 告诉 vue-server-renderer 去 app/view 查找异步 chunk 文件
			basedir: path.join(app.baseDir, 'app/view')
		}
	};

	exports.logger = {
		consoleLevel: 'DEBUG',
		dir: path.join(app.baseDir, 'logs')
	};

	exports.static = {
		prefix: '/static/',
		dir: path.join(app.baseDir, 'app/static')
	};
	exports.webpack = {
		proxy: {
			host: 'http://127.0.0.1:9000', // target host that matched path will be proxy to
			match: /^\/static\//, // proxy url path pattern.
		},
	}

	exports.keys = app.name + '_1537409827938_2257';
	exports.security = {
		csrf: {
			// 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
			// @todo 对于RESTful api应该如何解决跨域问题
			ignoreJSON: true,
			enable: false
		},
	},
	exports.middleware = [
		'access'
	];
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
			// 由于静态资源必须要有一个来源，如果你不愿意选择代理服务器来帮你代理静态资源（会出现404），
			// 但是 你可以选择由本服务器直接读取你本地的静态文件作为来源，ibase的映射已经配置在config.default.js中，你只需要修改一个路径，变量名称为：ibaseDir。
		},
		/*proxy_1: {
			proxyConfig: {
				// target:'http://bdcsq.zsfdc.gov.cn',
				target: 'http://172.16.42.16:8080',
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
				"/demo2/:foo*"
			],
			//是否代理静态资源
			isProxyStatic: true,
		},*/
	}

	return exports;
};
