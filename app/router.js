//启用严格模式
'usestrict';
// egg服务端 路由配置
module.exports = app => {
	var ip = require("ip");
	const localIP = ip.address();
	const {router, controller} = app;												//声明routercontroller
	// todo 待处理服务端渲染加速问题
	// app.get('/', app.controller.app.client);										//根路径渲染服务器首页用(默认为客户端渲染）

	// 一旦登陆 直接重定向到 cas/login 页面要求登录 http://192.168.10.32:8090/cas/login?service=http%3A%2F%2F192.168.10.32%3A8090%2FmainWeb%2Findex%2Fgdbdc
	// app.router.redirect('/',`/cas/login?service=%2FmainWeb%2Findex%2Fgdbdc`,302)		//重定向首页路径到 /cas/login页面
	app.router.redirect('/',`/cas/login?service=http%3A%2F%2F${localIP}%3A8090%2FmainWeb%2Findex/gdbdc`,302)		//重定向首页路径到 /cas/login页面

	app.get('/', app.controller.app.client);										//根路径渲染服务器首页用(默认为客户端渲染）

	app.get('/mainWeb/index/1', app.controller.app.mainIndexClient);				//根路径渲染服务器首页用(默认为客户端渲染）

	app.get('/mainWeb/index/gdbdc', app.controller.app.demoAppClient);				//根路径渲染服务器首页用(默认为客户端渲染）

	// app.get('/client', app.controller.app.index);								//根路径渲染服务器首页用

	// app.get('/(/.+)?', app.controller.app.index);								//根路径，只有一个.（dot）

	app.get('/api/article/list', app.controller.app.list);							//获取文章列表页面

	app.get('/api/article/:id', app.controller.app.detail);							// 获取文章列表哦数据

	//app.get('/eggServer(/.+)?',app.controller.app.index);							//获取eggServer服务
};
