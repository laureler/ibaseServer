//启用严格模式
'usestrict';
// egg服务端 路由配置
module.exports = app => {

	const {router, controller} = app;												//声明routercontroller
	// todo 待处理服务端渲染加速问题
	app.get('/', app.controller.app.demoAppClient);									//根路径渲染服务器首页用(默认为客户端渲染）

	app.get('/mainWeb/index/1', app.controller.app.mainIndexClient);				//根路径渲染服务器首页用(默认为客户端渲染）

	app.get('/mainWeb/index/gdbdc', app.controller.app.demoAppClient);				//根路径渲染服务器首页用(默认为客户端渲染）

	// app.get('/client', app.controller.app.index);								//根路径渲染服务器首页用

	// app.get('/(/.+)?', app.controller.app.index);								//根路径，只有一个.（dot）

	app.get('/api/article/list', app.controller.app.list);							//获取文章列表页面

	app.get('/api/article/:id', app.controller.app.detail);							// 获取文章列表哦数据

	//app.get('/eggServer(/.+)?',app.controller.app.index);							//获取eggServer服务
};
