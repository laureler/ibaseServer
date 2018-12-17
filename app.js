module.exports = app => {
	// 运行中间件
	app.config.coreMiddleware.unshift('httpProxy');
};
