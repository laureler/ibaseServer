'use strict';
// vue 加载初始化 过程
import App from 'framework/app.js';
// 组件入口
import index from './demoIndex.vue';
// 全局配置
import createStore from './store';
// 路由
import createRouter from './router';
// todo 国际化
// import createI18n from 'framework/i18n/admin';

const options = {base: '/'};

// 初始化vue组件相关
export default new App({
	index,			// 单文件组件入口
	options,		//相关配置
	createStore,	//初始化全局strore
	createRouter,	//初始化路由
	// createI18n,	//i18n 国际化配置
}).bootstrap();
