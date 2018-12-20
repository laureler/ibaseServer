<template>
	<Layout :title="baseIndex">
		<transition name="fade" mode="out-in">
			<router-view></router-view>
		</transition>
	</Layout>
</template>
<script type="text/babel">
	// 引入vue.js
	import Vue from "vue";

	// 引入elementui.js
	import ElementUI from "element-ui";

	// 引入elementui.css
	import 'element-ui/lib/theme-chalk/index.css';

	//引入 layout根部布局
	import Layout from '@/components/layout/app/index.vue';

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
				"baseIndex":"baseIndex"
			};
		}
	}
</script>
