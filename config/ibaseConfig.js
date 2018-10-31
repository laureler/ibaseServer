


var ibaseConfig = ()=>{
	var path = require('path');
	var ibaseDir  = "D://sourceCode/ibase_sprint004"
	var staticConfig  = [
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
		{
			prefix: '/mainWeb/images',
			dir: path.join(ibaseDir, '/wimushroom/源码/main/mainWeb/src/main/webapp/img'),
		},
		{
			prefix: '/pubWeb',
			dir: path.join(ibaseDir, '/wimushroom/源码/main/pubWeb/src/main/webapp'),
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
			dir: path.join(ibaseDir, '/wimushroom/源码/custom/customModuleWebService/src/main/webapp'),
		},
	]
	return staticConfig
	
}
module.exports = ibaseConfig