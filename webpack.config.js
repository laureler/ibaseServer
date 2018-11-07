'use strict';
module.exports = {
	egg: true,
	framework: 'vue',
	entry: {
		app: 'app/web/page/app/index.js'
	},
	alias: {
		component: 'app/web/component',
		framework: 'app/web/framework',
		store: 'app/web/store',
		vue: 'vue/dist/vue.esm.js',
	},
	dll: ['vue', 'axios', 'vue-router', 'vuex', 'vuex-router-sync'],
	loaders: {},
	// publicPath: '/eggServer/public',
	// buildPath:' ${app_root}/eggServer/public',
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