'use strict';
module.exports = {
	egg: true,			//特殊参数，只有使用egg server-side-render 特殊配置，需要设置为true， 表示webpack构建的服务端文件放入到了 /app/view目录中
	framework: 'vue',   // vue | react|weex|html|js 物种配置（使用easywebpack-cli构建的时候，才需要本参数）
	env:'dev',  // dev(default)|test|prod
	// type:'',   // client |server|web|weex （使用easywebpack-cli构建的时候，才需要本参数）
	// webpack 构建入口文件配置
	entry: {
		app: 'app/web/page/app/index.js'
	},
	// 访问路径配置
	publicPath: '/static/',
	buildPath:'app/static',
	alias: {
		component: 'app/web/component',
		framework: 'app/web/framework',
		store: 'app/web/store',
		vue: 'vue/dist/vue.esm.js',
	},
	dll: ['vue', 'axios', 'vue-router', 'vuex', 'vuex-router-sync'],
	loaders: {},

	proxy: {
		// host: 'http://127.0.0.1:9000', // target host that matched path will be proxy to
		// match: /^\/eggServer\//, // proxy url path pattern.
	},
	plugins: {
		copy: [{
			from: 'app/web/asset/css/bootstrap.min.css',
			to: 'asset/css/bootstrap.min.css'
		}]
	},
	done() {

	}
};