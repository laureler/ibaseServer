'use strict';
// 注意 easy-webpack 默认使用了部分常用配置（约定优于配置）
// 此处的配置文件并非json文件，而是一个exports 对象的JS文件， 故而可以在此对象返回之前使用表达式，例如： path.join("","")
// 本项目使用easywebpack构建 详情文档请参考：https://www.yuque.com/easy-team/easywebpack
module.exports = {
	egg: true,			//特殊参数，只有使用egg server-side-render 特殊配置，需要设置为true， 表示webpack构建的服务端文件放入到了 /app/view目录中
	framework: 'vue',   // vue | react|weex|html|js 五种配置（使用easywebpack-cli构建的时候，才需要本参数）
	// env:'dev',  // dev(default)|test|prod
	// type:'',   // client |server|web|weex （使用easywebpack-cli构建的时候，才需要本参数）

	// webpack 构建入口文件配置
	/*
	这里是匹配条件，每个选项都接收一个正则表达式或字符串
	1. test 和 include 具有相同的作用，都是必须匹配选项
	2. exclude 是必不匹配选项（优先于 test 和 include）
	最佳实践：
	- 只在 test 和 文件名匹配 中使用正则表达式
	- 在 include 和 exclude 中使用绝对路径数组
	- 尽量避免 exclude，更倾向于使用 include

	*/
	entry: {
		appClient: 'app/web/page/app/index.js',

		// app/app.js?loader=false 代表当前文件不使用loader，他是一个SPA服务端渲染的example
		// include: ['app/web/page', { 'app/index': 'app/web/page/app/index.js?loader=false' }],
		// exclude: ['app/web/page/[a-z]+/component', 'app/web/page/test'],
		// loader: {
		// 	client: 'app/web/framework/vue/entry/client-loader.js',
		// 	server: 'app/web/framework/vue/entry/server-loader.js',
		// }
	},
	alias: {
		component: 'app/web/component',
		framework: 'app/web/framework',
		store: 'app/web/store',
		vue: 'vue/dist/vue.esm.js',
		// 'vue$': 'vue/dist/vue.esm.js',
		// '@': path.join(__dirname, '../', 'app'), 			//整个项目的 {appRoot} 其实可以理解为主文件夹的根路径
		// server: 'app/web/framework/vue/entry/server.js',	//服务端渲染入口
		// client: 'app/web/framework/vue/entry/client.js',	//客户端渲染入口
		// asset: 'app/web/asset',								//静态资源位置
	},
	// 静态资源路径配置为 static 开头
	publicPath: '/static/',
	// 注意：开发模式下，文件不落地磁盘（开发模式的编译文件存储在内存中）
	buildPath:'static',
	// webpack dll方案（打包过程不再打包以下配置中的任何代码）
	dll: ['vue', 'axios', 'vue-router', 'vuex', 'vuex-router-sync'],

	loaders: {

	},

	proxy: {
		// host: 'http://127.0.0.1:9000', // target host that matched path will be proxy to
		// match: /^\/eggServer\//, // proxy url path pattern.
	},
	// devtool:"source-map", //开启source-map模式
	// webpack插件列表 详情文档参考：
	//  https://www.yuque.com/easy-team/easywebpack/plugin
	plugins: {
		copy: [{ // copy-webpack-plugin 别名
			from: 'app/web/asset/css/bootstrap.min.css',
			to: 'asset/css/bootstrap.min.css'
		}]
	},
	// 编译钩子函数 完成编译之后调用  参数stats
	//参数stats链接： https://www.webpackjs.com/configuration/stats/#stats
	//钩子函数链接： https://github.com/webpack/webpack.js.org/blob/master/src/content/api/compiler-hooks.md#done
	done() {
		// 一般用来编译成功上传 CDN
	}
};
