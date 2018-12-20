import Vue from 'vue';

import VueRouter from 'vue-router';
/********************** 引入组件 start **************************/
import Index from '@/components/baseApp/views/index'
import codeDictManage from '../../../components/system/codeDictManage' //代码字典

// 工作列表
import createJob from '../../../components/myJob/createJob' //创建工作
import concludedJob from '../../../components/myJob/concludedJob' //办结工作列表
import runJob from '../../../components/myJob/runJob' //待办工作列表
import deletedJob from '../../../components/myJob/deletedJob' //删除箱
import returnJob from '../../../components/myJob/returnJob' // 退件
import suspensionJob from '../../../components/myJob/suspensionJob' //挂起
import monitorJob from '../../../components/myJob/monitorJob' //监控
import receiptJob from '../../../components/myJob/receiptJob' //收文
import handleJob from '../../../components/myJob/handleJob' //已办工作
/********************** 引入组件 end **************************/
import ListView from './list';


Vue.use(VueRouter);

export default function createRouter() {
	return new VueRouter({
		mode: 'history',
		// base: '/',
		routes: [
			// {path: '', component: ListView},
			// {path: '/list', component: ListView},
			// {path: '/detail/:id', component: () => import('./detail')},
			{path: '*',
				components: {default:Index,},
				children:[
					{path:'',components:{
							// 系统管理
							'system/codeDictManage':codeDictManage,
							// 工作列表
							'myJob/concludedJob':concludedJob,
							'myJob/createJob':createJob,
							'myJob/runJob':runJob,
							'myJob/deletedJob':deletedJob,
							'myJob/returnJob':returnJob,
							'myJob/suspensionJob':suspensionJob,
							'myJob/monitorJob':monitorJob,
							'myJob/receiptJob':receiptJob,
							'myJob/handleJob':handleJob
						}
					}
				]
			},
		]
	});
}

