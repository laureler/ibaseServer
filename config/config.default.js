'use strict';
var path = require('path');

module.exports = appInfo => {
	const config = exports = {};
	
	
	//如果需要配置ibase项目 添加ibase项目的基本地址 例如： d://ibase2.0  其中ibase2.0内部应当有两个文件(.gitignore、readme.md)一个文件夹(wimushroom)
	var ibaseDir  = "C://dev/projects/ibase_sprint004"
	
	// 如果有配置没有加上，可以在此提交代码，prefix为根路径后面的相对路径（localhost:8080/mainWeb/index/1 --->你只需要写/mainWeb就可以了，所有的mainWeb后面的都会给你配置上去。）、dir为你的静态资源相对路径
	config.multipleStatic = [
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
	
	// config.static = {
	//   prefix: '/',
	//   dir: path.join(appInfo.baseDir, '../../sourceCode/ibase_sprint004/wimushroom/源码'),
	// }
	// use for cookie sign key, should change to your own and keep security
	config.keys = appInfo.name + '_1537409827938_2257';
	config.security = {
		csrf: {
			// 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
			// @todo 对于RESTful api应该如何解决跨域问题
			ignoreJSON: true,
			enable: false
		},
	},
		// add your config here
		config.middleware = [];
	
	return config;
};
