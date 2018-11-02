'use strict';
// had enabled by egg
// exports.static = true;
// egg 使用插件列表
module.exports = {
	// vue: {
	// 	enable: true,
	// 	package: 'egg-view-vue'
	// },
	// webpack: {
	// 	enable: true,
	// 	package: 'egg-webpack',
	// 	env: 'local'
	// },
	// easyvue: {
	// 	enable: true,
	// 	package: "egg-easyvue"
	// },
	// validate: {
	// 	enable: true,
	// 	package: 'egg-validate'
	// },
	multipleStatic : {
		enable: true,
		package: 'egg-multiple-static',
	}
}