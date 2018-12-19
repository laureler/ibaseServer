<template>
	<Layout>
		<transition name="fade" mode="out-in">
			<router-view></router-view>
		</transition>
	</Layout>
</template>
<script type="text/babel">
	// 引入vue.js
	import * as Vue from "vue";

	// 引入elementui.js
	import * as ElementUI from "element-ui";

	// 引入elementui.css
	import 'element-ui/lib/theme-chalk/index.css';

	//引入 layout根部布局
	import Layout from 'component/layout/app/index.vue';

	//加载elementui
	Vue.use(ElementUI)

	export default {
		components: {
			Layout
		},
		mounted() {

		}
	}
</script>
