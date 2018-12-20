<template>
	<Layout :title="title"></Layout>
</template>
<script type="text/babel">
	// 引入vue.js
	import Vue from "vue";

	// import axios from 'axios'
	// import VueAxios from 'vue-axios'
	// Vue.use(VueAxios,axios)

	// 引入elementui.js
	import ElementUI from "element-ui";
	// 引入elementui.css
	import 'element-ui/lib/theme-chalk/index.css';
	//引入 layout根部布局
	import Layout from '@/components/baseApp/app/index.vue';
	//************************ 引入 ibase相关依赖********************************* start
	// 引入util
	import util from "./ibasePlugin/util/util.js"
	// 引入sgui组件
	import sguiBsc from './ibasePlugin/sgui_bsc.js'
	// 引入http相关
	import httpaxios from './ibasePlugin/common/http.js'
	//************************ 引入 ibase相关依赖********************************* end

	// *********************** ibase2.0 挂载全局对象 ****************************** start
	// 挂载sgui组件
	Vue.use(sguiBsc)
	// vue.$utilHelper 对象挂载
	Vue.prototype.$utilHelper = util
	// Vue.$http 对象挂载
	Vue.prototype.$http= httpaxios;
	// todo 说明
	Vue.config.productionTip = false
	// todo 抽取到其他文件中
	global.isVueProject=true;
	global.showSuccess=function(message,title){
		if(title){
			components.main.$SgNotice.success({
				title: title,
				desc:message||""
			});
		}else{
			components.main.$SgNotice.success({
				title: message||""
			});
		}
	}

	global.closeLiTabPage=function(){

	}
	// *********************** ibase2.0 挂载全局对象 ****************************** end

	//加载elementui
	Vue.use(ElementUI)

	export default {
		components: {
			Layout
		},
		mounted() {

		},
		data() {
			return {
				"title":"mainWeb/index/1"
			};
		}
	}
</script>
