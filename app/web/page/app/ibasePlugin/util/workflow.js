
import { typeJduge } from '@/page/app/ibasePlugin/util/typeJduge'

/*工作流处理类*/
function workflow(vue){
	this.nowVue=vue||{};
	//验证时忽略验证的字段
	this.yzhlList={};
	//link只知道保存的请求回来的某个数据
	this.link="";
	this.userInfos={};
	//保存的环节信息
	this.definitionInfo = [];
	
	this.countersign=false;
	
	this.submitData={};
	//具体信息不知道
	this.nodeArr = [];
	//额外按钮配置信息
	this.extraBtn=[];
	//计数标识
	this.count=0;
	
	//创建后表达式
	this.createAfterEvents={};
	//打开后表达式
	this.openAfterEvents = [];
	//保存前表达式
	this.saveBeforeEvents = [];
	//提交前表达式
	this.beforeSubmitEvents = [];
	//保存后表达式
	this.saveEvents = [];
	//准备提交表达式
	this.readySubmitEvents = [];
	//提交后表达式
	this.submitEvents = [];
	//结档后表达式
	this.finishEvents = [];
	//退回后表达式
	this.returnEvents = [];
	//收回后表达式
	this.backOfficeEvents = [];
	this.init();
}

workflow.prototype={
	init:function(config){
		//初始化相关数据taskId 
		var dataSource=config||this.nowVue||{};
		this.taskId=dataSource.taskId||"";
		this.linkDefinitionKey=dataSource.linkDefinitionKey||"";
		this.processDefinitionId=dataSource.processDefinitionId||"";
		this.processInstanceId=dataSource.processInstanceId||"";
		this.businessNumber=dataSource.businessNumber||"";
	},
	//设置对应的vue对象 也可以直接给nowVue赋值
	setVue:function(vue){
		this.nowVue=vue;
	},
	//清空表达式
	clearEvents:function(){
		this.createAfterEvents = [];
		this.openAfterEvents = [];
		this.saveBeforeEvents = [];
		this.beforeSubmitEvents = [];
		this.saveEvents = [];
		this.readySubmitEvents = [];
		this.submitEvents = [];
		this.finishEvents = [];
		this.returnEvents = [];
		this.backOfficeEvents = [];
	},
	/**
	 * 查询数型数据，用于搜索功能
	 * data必须是json或者数组   查询的源数据
	 * text查询的值 为输入框输入的文本
	 * childName查询子数组的字段名   默认为children
	 * name为查询字段名称，如果没有则是查询全部
	 * */
	searchTree:function(data,text,childName,name){
		var ret=[];
		childName=childName||"children";
		if(text){
			if(typeJduge.Json(data)){
				compare(data);
			}else if(typeJduge.Array(data)){
				for(var a=0,lena=data.length;a<lena;a++){
					compare(data[a]);
				}
			}
		}
		function compare(Obj){
			if(name){
				if(Obj[name].indexOf(text)!=-1){
					ret.push(Obj);
				}
			}else{
				for(nam in Obj){
					if(Obj[nam].indexOf(text)!=-1){
						ret.push(Obj);
					}
				}
			}
			if(Obj[childName]&&typeJduge.Array(Obj[childName])){
				for(var i=0,len=Obj[childName].length;i<len;i++){
					compare(Obj[childName][i]);
				}
			}
		}
		return ret;
	},
	mergeNode:function(nodes, parentName){
		var newNodes = null;
		var curNode;
		if(nodes.length == 1) {
			curNode = nodes[0];
			var ppName = parentName;
			parentName = parentName + (parentName ? "/" : "") + curNode.userName;
			//只有一个节点，如果没有子节点，返回此节点组
			if(curNode.children == null || curNode.children.length == 0) { //人员节点
				var ppNode = {
					userId: ppName.replace(/\//g, "_"),
					userName: ppName,
					userStact: "",
					iconCls: 'icon-dept',
					number: "",
					children: []
				};
				ppNode.children.push(curNode);
				newNodes = [];
				newNodes.push(ppNode);
			} else if(curNode.children.length > 1) { //否则继续向下合并
				curNode.userName = parentName;
				curNode.userId = parentName.replace(/\//g, "_");
	
				newNodes = [];
				newNodes.push(curNode);
				curNode.children = this.mergeNode(curNode.children, "");
			} else {
				newNodes = this.mergeNode(curNode.children, parentName);
			}
		} else {
			newNodes = [];
			for(var inx = 0; inx < nodes.length; ++inx) {
				curNode = nodes[inx];
				if(curNode.children == null || curNode.children.length == 0) { //人员节点
					newNodes.push(curNode);
				} else if(curNode.children.length > 1) {
					curNode.userName = parentName + (parentName ? "/" : "") + curNode.userName;
					curNode.userId = curNode.userName.replace(/\//g, "_");
					newNodes.push(curNode);
					curNode.children = this.mergeNode(curNode.children, "");
				} else {
					var temps = this.mergeNode(curNode.children, curNode.userName);
					for(var iny = 0; iny < temps.length; ++iny)
						newNodes.push(temps[iny]);
				}
			}
		}
		return newNodes;
	},
	
	/**
	 * 分析数据，组合工作流返回的按钮信息
	 * configs为服务器返回数据
	 * Obj为Vue对象赋值对象 会将额外的按钮信息赋值改对象
	 */
	analyzeOperationConfigs:function(configs,Obj){
		if(!configs) {
			return;
		}
		this.clearEvents();
		this.nodeArr = configs[0];
		var operationConfigs = configs[0];
		var html = [];
		var sIcon = "";
		for(var i = 0; i < operationConfigs.length; i++) {
			sIcon = "";
			if(operationConfigs[i].operationImage) sIcon = operationConfigs[i].operationImage;
			if(operationConfigs[i].operationType == 3) {
				if(operationConfigs[i].operationEvent == 'AfterCreate'){
	        		this.createAfterEvents.push(operationConfigs[i]);
	        	}else if(operationConfigs[i].operationEvent == 'AfterOpen'){
	        		this.openAfterEvents.push(operationConfigs[i]);
	        	}else if(operationConfigs[i].operationEvent == 'AfterSave') {
					this.saveEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'BeforeSave') {
					this.saveBeforeEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'BeforeSubmit'){
	        		this.beforeSubmitEvents.push(operationConfigs[i]);
	        	} else if(operationConfigs[i].operationEvent == 'ReadySubmit'){
	        		this.readySubmitEvents.push(operationConfigs[i]);
	        	} else if(operationConfigs[i].operationEvent == 'AfterSubmit') {
					this.submitEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterFinish') {
					this.finishEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterReturn') {
					this.returnEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterBackOffice' || operationConfigs[i].operationEvent == 'AfterAllback') {
					this.backOfficeEvents.push(operationConfigs[i]);
				} else {
					html.push({
						id: "runscriptHref",
						name: "extraBtn" + i,
						text: operationConfigs[i].operationName,
						icon: sIcon,
						data: operationConfigs[i].operation
					});
				}
			} else if(operationConfigs[i].operationType == 4) {
				if(operationConfigs[i].operationEvent == 'AfterCreate'){
	        		this.createAfterEvents.push(operationConfigs[i]);
	        	}else if(operationConfigs[i].operationEvent == 'AfterOpen'){
	        		this.openAfterEvents.push(operationConfigs[i]);
	        	} else if(operationConfigs[i].operationEvent == 'AfterSave') {
					this.saveEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'BeforeSave') {
					this.saveBeforeEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'BeforeSubmit'){
	        		this.beforeSubmitEvents.push(operationConfigs[i]);
	        	} else if(operationConfigs[i].operationEvent == 'ReadySubmit'){
	        		this.readySubmitEvents.push(operationConfigs[i]);
	        	} else if(operationConfigs[i].operationEvent == 'AfterSubmit') {
					this.submitEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterFinish') {
					this.finishEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterReturn') {
					this.returnEvents.push(operationConfigs[i]);
				} else if(operationConfigs[i].operationEvent == 'AfterBackOffice' ||
					operationConfigs[i].operationEvent == 'AfterAllback') {
					this.backOfficeEvents.push(operationConfigs[i]);
				} else {
					html.push({
						id: "runscript"+ i,
						name: "extraBtn" + i,
						text: operationConfigs[i].operationName,
						icon: sIcon,
						data: i
					});
				}
			} else {
				html.push({
					id: "runscriptHref",
					name: "extraBtn" + i,
					text: operationConfigs[i].operationName,
					icon: sIcon,
					data: 'dynamicExecutionOperation?operationConfigId=' + operationConfigs[i].rid + '&taskId=' + this.taskId
				});
			}
		}
		this.extraBtn = html;
		if(Obj!=undefined){
			Obj=html;
		}
	},
	//请求方法，适配以前的使用
	invokeJson: function(url,data,calback){
		var async=true;
		if(calback.hasOwnProperty("async")){
			async=calback.async;
		}
		$.ajax({
	        url: url,
	        context: document.body,
	        async:async,
	        data: data,
	        success: calback.sFn,
	        error: calback.fFn
	    });
	},
	//执行表达式
	EventCallback: function(eventsExp, optTitle){
		var isOk = true;
		if(!eventsExp || eventsExp.length <= 0)
			return isOk;
		for(var temp in eventsExp) {
			try {
				if(eventsExp[temp].operationType == 3) { //前端url处理
					var operation = eventsExp[temp].operation;
					var operationUrl = operation;
					if(operation.lastIndexOf('?') != -1){
						operationUrl = operation.substring(0,operation.lastIndexOf('?'));
					}
					//获取url后面的参数
					var paramsUrl = operation.substring(operation.lastIndexOf('?')+1).split('&');
					var params = {};
					//整理url参数并对含有表达式的参数执行其中的 JavaScript代码
					for(var i=0;i<paramsUrl.length;i++){
						var paramArr = paramsUrl[i].split('=');
						if(paramArr.length > 1){
							if(paramArr[1] && paramArr[1].indexOf("$") == 0){
								params[paramArr[0]] = decodeURI(validexec.apply(this.nowVue,[paramArr[1]]));
							}else{
								params[paramArr[0]] = decodeURI(paramArr[1]);
							}
						}
					}
					$.ajax({
						url: operationUrl,
						data:params,
						context: document.body,
						type: 'GET',
						asyn: false,
						dataType: "json",
						success: function(data) {
							//url地址执行成功
						},
						error: function(xhr, stat, exmsg) {
							showAjaxError(xhr,stat,exmsg,optTitle + "URL请求错误");
						}
					});
				} else if(eventsExp[temp].operationType == 4) { //前端脚本处理
					validexec.apply(this.nowVue,[eventsExp[temp].operation]);
				}
			} catch(e) {
				var expstr = eventsExp[temp].operation;
				if(expstr.length > 100) {
					expstr = expstr.substr(0, 100) + "...";
				}
				console.error(e.message+"。"+optTitle+"表达式执行错误："+expstr);
				showError(e.message+"。第"+temp+"项表达式：<br>\n"+expstr,optTitle+"表达式执行错误");
				if(optTitle == '(列表)提交后'){
					showError("可能是表达式错误或者此工作必须要打开才能正确【提交】");
				}
				isOk = false;
			}
		}
		return isOk;
	},
	
	EventBeforeCallback: function(eventsExp, optTitle){
		if(!eventsExp || eventsExp.length <= 0)
		return true;

		var bOK = true;
		for(var temp in eventsExp) {
			bOK = true;
			try {
				if(eventsExp[temp].operationType == 3) { //前端url处理
					$.ajax({
						url: eventsExp[temp].operation,
						context: document.body,
						type: 'POST',
						asyn: false,
						dataType: "json",
						success: function(data) {
							//url地址执行成功，返回（广义）true或false
							bOK = (data && data != "false" && data != "0");
						},
						error: function(xhr, stat, exmsg) {
							showAjaxError(xhr,stat,exmsg,optTitle+"URL请求错误");
							bOK = true; //执行出错，允许操作
						}
					});
				} else if(eventsExp[temp].operationType == 4) { //前端脚本处理
					bOK = validexec.apply(this.nowVue,[eventsExp[temp].operation]);
				}
			} catch(e) { //执行出错，允许操作
				var expstr = eventsExp[temp].operation;
				if(expstr.length > 100) {
					expstr = expstr.substr(0, 100) + "...";
				}
				showError(e.message+"。第"+temp+"项表达式：<br>\n"+expstr,optTitle+"表达式执行错误");
				bOK = true;
			}
			if(bOK == false) return false;
		}
		return true;
	},
	
	EventReadySubmitCallback: function(eventsExp,optTitle){
		try{
			if(eventsExp.operationType == 3){//前端url处理
				var operation = eventsExp.operation;
				var operationUrl = operation;
				if(operation.lastIndexOf('?') != -1){
					operationUrl = operation.substring(0,operation.lastIndexOf('?'));
				}
				//获取url后面的参数
				var paramsUrl = operation.substring(operation.lastIndexOf('?')+1).split('&');
				var params = {};
				//整理url参数并对含有表达式的参数执行其中的 JavaScript代码
				for(var i=0;i<paramsUrl.length;i++){
					var paramArr = paramsUrl[i].split('=');
					if(paramArr.length > 1){
						if(paramArr[1] && paramArr[1].indexOf("$") == 0){
							params[paramArr[0]] = decodeURI(validexec.apply(this.nowVue,[paramArr[1]]));
						}else{
							params[paramArr[0]] = decodeURI(paramArr[1]);
						}
					}
				}
				$.ajax({
				  url: operationUrl,
				  data:params,
				  context: document.body,
				  type: 'GET',
				  asyn: false,
				  dataType: "json",
				  success: function(data) {
				  	//url地址执行成功
				  },
				  error: function(xhr,stat,exmsg){
				  	showAjaxError(xhr,stat,exmsg,optTitle+"URL请求错误");
				  }
				});
			}else if(eventsExp.operationType == 4){//前端脚本处理
				validexec.apply(this.nowVue,[eventsExp.operation]);
			}
		}catch(e){
			var expstr=eventsExp.operation;
			if(expstr.length>100){
				expstr=expstr.substr(0,100)+"...";
			}
			console.error(e.message+"。"+optTitle+"表达式执行错误："+expstr);
			showError(e.message+"。该项表达式：<br>\n"+expstr,optTitle+"表达式执行错误");
		}
	},
	
	fireSubmitAfter: function(taskId, bArch){
		var isOk = true;
		//(2)保存后前端功能操作
		this.EventCallback(this.saveEvents, "保存后");
		//(1)提交成功后触发前端功能操作
		isOk = this.EventCallback(this.submitEvents, "提交后");
		//是否已结档（如果是，则再执行结档后事件）
		if(bArch) this.EventCallback(this.finishEvents, "结档后");
		return isOk;
	},
	/**
	 * 关闭当前业务窗口，并刷新所有已打开的工作列表iframe
	 */
	flushWorkTabs: function(jobWinId){
		jobWinId = jobWinId || window.frameElement.name;
		if(jobWinId && jobWinId != 'page029bd0cb801f4adbb6b1a159f38ccee6') {
			window.parent.closeLiTabPage(jobWinId);
		}
	},
	/**
	 * 查询转办信息的请求
	 * */
	getlinkInstance:function(taskId,cakkback){
		var _this=this;
		$.ajax({
	        url: "/workflowWebService/findLinkInstanceByTaskIdPassto",
	        context: document.body,
	        data: {
	            taskId: taskId
	        },
	        success: function(data, type) {
	        	cakkback&&cakkback.apply(_this,arguments);
	        },
	        error: function(xhr,stat,exmsg){
	        	showAjaxError(xhr,stat,exmsg,"");
	        }
	    });
	},
	//转办弹窗
	createPassToDialog:function(title,data,callback){
		var _this=this;
		this.yzhlList["dialogReason"]=true;
		this.nowVue.dialog = {
			id:data.id||("dialog"+new Date().getTime()),
			title: title,
			visible: true,
			full: false,
			footer: true,
			width: "650px",
			canClose: true,
			body: `<el-container style="height: 500px; border: 1px solid #eee">
					  	<el-container>
						    <el-main style="overflow:hidden;">
						      	<el-tabs type="card" v-model="currTab" class="tabBefore">
						      		<el-tab-pane 
						      			v-for="(item,index) in tree"
						      			:key="index"
						      			:label="item.label">
						      			<el-input
						      				v-if="item.ref=='other'"
											style="width:calc(100% - 20px);margin:0 10px;"
										  	v-model="searchText"
										  	size="small"
										  	clearable
										  	placeholder="请输入内容">
										  	<el-button slot="append" icon="el-icon-search" @click="handleIconClick"></el-button>
										</el-input>
						      			<div :style="{'height':item.ref=='other'?'calc(100% - 32px)':'100%','overflow':'auto'}">
						      				<el-tree
											  	:data="item.data"
											  	:ref="item.ref"
											  	node-key="userId"
											  	default-expand-all
											  	:expand-on-click-node="flag0"
											  	:highlight-current="highlight">
							      				<span class="custom-tree-node" slot-scope="scope">
											        <span>{{ scope.data.userName }}</span>
											        <span v-if="scope.data.ref=='master'">待处理任务:{{scope.data.number}}条,在职状态:{{ scope.data.userStact }}</span>
										      	</span>
											</el-tree>
						      			</div>
						      		</el-tab-pane>
								</el-tabs>
								<span style="margin-top:5px;display:block;">注意事项</span>
								<i-input :iData="dialogReason" v-model="value" common="true"></i-input>
						    </el-main>
					  	</el-container>
					</el-container>`,
			footList: [
				{
					name: 0,
					type:"checkbox",
					text: "紧急",
					value:false
				},
				{
					name: 1,
					text: "提 交"
				}
			],
			data: {
				value:"",
				currTab:"",
				flag0:false,
				flag1:true,
				tree:data.tree,
				searchText:"",
				highlight:true,
				dialogReason:{
					"fname": "dialogReason",
					"security": "notnull,edit",
					"multiline": "true",
					"zindex": "",
					"width": "588px",
					"height": "50px",
					"margin": "0px 0px 0px 0px",
					"fonts": ""
				},
				handleIconClick:function(){//转办弹窗搜索框
					var dislog=_this.nowVue.dialogComponent;
					if(dislog.searchText){
						var other;
						for(var i=0,len=dislog.tree.length;i<len;i++){
							if(dislog.tree[i].ref=="other"){
								other=dislog.tree[i];
							}
						}
						if(other){
							var res=_this.searchTree(other.data,dislog.searchText,"children","userName");
							if(res.length){
								if(dislog.$refs.other[0]){
									dislog.$refs.other[0].setCurrentKey(res[0].userId);
									dislog.$refs.other[0].$nextTick(function(){
										var current=this.$el.querySelector(".is-current");
										if(current){
											current.scrollIntoView();
										}
									})
								}
							}
						}
					}
				},
				callback: function(event, type) {
					callback&&callback.apply(_this,[this]);
				}
			}
		};
	},
	/**
	 * 展示转办环节的信息
	 * */
	linkDefinitionInfoPassTo:function(index, data){
		var result=[];
		var _this=this;
		if(index){
			if(this.definitionInfo[index].masterMen.length > 0 || (this.definitionInfo[index].countersign && this.definitionInfo[index].normalMen.length > 0)) {
				var masterMens = [];
				for(var a in this.userInfos) {
					let item={
						userId: a,
						userName: this.userInfos[a]?this.userInfos[a].organInfo.organName:"用户名不存在，可能已被删除",
						userStact: "离职",
						iconCls: 'icon-man',
						number: this.userInfos[a]?(this.userInfos[a].count||0):0
					};
					var fullNames = this.userInfos[a].fullName.split("/");
					if(fullNames.length <= 1) {
						masterMens.push(item);
					} else {
						var inx = 0;
						var leafCont = _this.addUserParentNode(masterMens, inx, fullNames);
						leafCont.push(item);
					}
				}
				//将多个单节点合并成一个
				if(masterMens.length == 1) {
					var dealNode = masterMens[0];
					var layName = "";
					while(dealNode && dealNode.children && dealNode.children.length == 1) {
						layName += "/" + dealNode.userName;
						dealNode = dealNode.children[0];
					}
					if(layName) {
						var sub = null;
						if(dealNode && dealNode.children && dealNode.children.length > 1) {
							layName += "/" + dealNode.userName;
							var sub = {
								userId: "", //layName.replace(/\//g,"_"),
								userName: layName.substr(1),
								userStact: "",
								iconCls: 'icon-dept',
								number: "",
								children: dealNode.children
							};
						} else {
							var sub = {
								userId: "", // layName,
								userName: layName.substr(1),
								userStact: "",
								iconCls: 'icon-dept',
								number: "",
								children: [dealNode]
							};
						}
						masterMens[0] = sub;
					}
				}
		
				if(masterMens != null && masterMens.length > 0) {
					masterMens = this.mergeNode(masterMens, "");
					if(masterMens.length > 1) {
						var allNode = [];
						var an = {
							userId: "alldept",
							userName: "所有部门",
							userStact: "",
							iconCls: 'icon-dept',
							number: "",
							children: masterMens
						}
						allNode.push(an);
						masterMens = allNode;
					}
				}
				result.push({
					ref:"master",
					label:"选择处理人",
					data:masterMens
				});
			}
		}
	
		if(data.notTranmitOther&& data.notTranmitOther == 'true' && data.Manager == 0) {} else {
			var _url='/mainWeb/system/getOrganTree?valid=1&type=2';
			$.ajax({
				url:_url,
				type:"POST",
				async: false,
				dataType:"json",
				success:function(data){
					var arr=[];
					for(let i=0,len=data.length;i<len;i++){
						var item={
							userId: data[i].id=="#"?"alldept":data[i].id,
							userName: data[i].text,
							userStact: "离职",
							iconCls: data[i].iconCls,
							number: data[i].id=="#"?"":(_this.userInfos[data[i].id]?(_this.userInfos[data[i].id].count||0):0),
							children:[]
						}
						if(data[i].attributes.status == 1 || data[i].attributes.status == 2) {
							item.userStact = "在职";
						}
						sortData(item,data[i].children);
						arr.push(item);
					}
					
					function sortData(data,arr){
						for(let i=0,len=arr.length;i<len;i++){
							var item={
								userId: arr[i].id=="#"?"alldept":arr[i].id,
								userName: arr[i].text,
								userStact: "离职",
								iconCls: arr[i].iconCls,
								number: arr[i].id=="#"?"":(_this.userInfos[arr[i].id]?(_this.userInfos[arr[i].id].count||0):0),
								children:[]
							}
							if(arr[i].attributes.status == 1 || arr[i].attributes.status == 2) {
								item.userStact = "在职";
							}
							if(arr[i].children&&arr[i].children.length){
								sortData(item,arr[i].children);
							}
							data.children.push(item);
						}
					}
					result.push({
						ref:"other",
						label:index?"另选处理人":"选择转办人",
						data:arr
					});
				},
				error:function(xhr){
					showError('组织结构数据获取失败',"提示");
				}
			});
		}
		return result;
	},
	
	/*转办工作流*/
	//展示转办弹出对话框
	showPasstoDialog:function(taskId,isCloseTab){
		this.getlinkInstance(taskId,function(data){
			var subTasks = data.subTask;
			this.userInfos = data.userInfos||{};
			var assignees = data.assignees;//获取当前环节在办的办理人
			var linkKey = data.definition.mDefinitionKey;
			this.link = linkKey;
			this.definitionInfo[linkKey] = data.definition;
			//获取转办环节信息
			var selectTab=this.linkDefinitionInfoPassTo(linkKey, data);
			this.createPassToDialog("转办",{
				tree:selectTab
			},function(Obj){
				this.passToSubmit(Obj,taskId,assignees,isCloseTab);
			});
		});
	},
	
	/*转办工作流*/
	//批量转办
	passtoDialogMore:function(taskIds){
		var selectTab=this.linkDefinitionInfoPassTo(false, {});
		this.createPassToDialog("批量转办",{
			tree:selectTab
		},function(Obj){
			this.passToSubmit(Obj,taskIds,null,false);
		});
	},
	
	//提交转办信息
	passToSubmit:function(Obj,taskId,assignees,isCloseTab){
		var _this=this;
		var flag=false;
		var masterMens = [];
		var userName = "";
		var passToReanson = Obj.value;
		var passtotitle = Obj.tree[Obj.currTab].label;
	
		if(passtotitle == '另选处理人'||passtotitle == '选择转办人') {
			userName = Obj.$refs.other[0].getCurrentKey();
		} else {
			var MasterPeople =Obj.$refs.master[0].getCurrentKey();
			var reg = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/;
			if(MasterPeople != null) {
				var r = MasterPeople.match(reg);
				if(r) {
					userName = MasterPeople;
				}
			}
		}
		if(!userName) {
			this.nowVue.$SgNotice.error({title: '请选择一个处理人！'});
			return;
		}else{
			var user=Obj.$refs.other[0].getCurrentNode();
			if(user.iconCls=='icon-man'){
				//判断选择的用户是否为当前环节的办理人，若是则不允许转办
				if(assignees && assignees.indexOf(userName)!=-1){
					this.nowVue.$SgNotice.error({title: '该用户已是当前环节办理人，请重新选择！'});
					return;
				}
			}else{
				this.nowVue.$SgNotice.error({title: '请选择一个处理人！'});
				return;
			}
		}
		if(passToReanson == "") {
			this.nowVue.$SgNotice.error({title: '请填写原因'});
			return;
		}
		var emergencyLevel = this.nowVue.dialog.footList[0].value?1:0;
		//单个taskId
		if(typeof taskId=='string'){
			$.ajax({
				url: "/workflowWebService/passTo",
				context: document.body,
				data: {
					taskIds: taskId,
					userName: userName,
					passToReanson: passToReanson,
					emergencyLevel: emergencyLevel
				},
				success: function(data, type) {
					if(!data) {
						//关闭标签页
						if(isCloseTab){
							_this.nowVue.$SgNotice.success({
								title: '转办操作成功'
							});
							_this.flushWorkTabs();
						}else{
							_this.nowVue.dialog.visible=false;
							_this.nowVue.$SgNotice.success({
								title: '转办操作成功'
							});
						}
						setTimeout(function(){
							//刷新工作列表的表格数据
							_this.reloadDatagrid(isCloseTab);
						},500);
						return;
					}
					showError("转办错误");
				},
				error: function(xhr, stat, exmsg) {
					showAjaxError(xhr,stat,exmsg,"");
				}
			});
		}else{
			var sFn = function(data){
				//刷新列表
				_this.reloadDatagrid();
			}
			var fFn = function(xhr,stat,exmsg){
				if($("#winList").length <= 0){
					showAjaxError(xhr,stat,exmsg,"转办出错");
				}
			};
			$.ajax({
				url:"/workflowWebService/removeBatchOperationCache",
				data:{"cacheKey":"batchPassTo_"},
				success:function(data){
					_this.showProgressDialog({
						action:"转办",
						infoUrl:"/workflowWebService/getBatchPassToStatus",
						abortUrl:"/workflowWebService/cancelPassTo",
						onfinish:function(info,action){
							_this.showErrorInfo(info,action);
						}
					});
					_this.invokeJson("/workflowWebService/passTo",{taskIds: taskId.join(','),userName:userName,passToReanson:passToReanson,emergencyLevel:emergencyLevel},{sFn:sFn,fFn:fFn});
				}
			});
		}
	},
	//工作操作后同时判断打开的页签并刷新对应列表的表格数据
	reloadDatagrid: function(isCloseTab) {
		if(isCloseTab){
			//刷新创建工作列表
			if(window.parent.$("[originname='CREATEJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='CREATEJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData();
			}
			//刷新待办工作列表
			if(window.parent.$("[originname='RUNJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='RUNJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData();
			}
			//刷新已办工作列表
			if(window.parent.$("[originname='HANDLEDJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='HANDLEDJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData();
			}
			//刷新已挂起工作列表
			if(window.parent.$("[originname='SUSPENSIONJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='SUSPENSIONJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData();
			}
			//刷新办结工作列表
			if(window.parent.$("[originname='CONCLUDEDJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='CONCLUDEDJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData();
			}
			//刷新监控工作列表
			if(window.parent.$("[originname='MONITORJOB'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='MONITORJOB'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData(1);
			}
			//刷新我的草稿箱列表
			if(window.parent.$("[originname='BUSINESSDRAFT'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='BUSINESSDRAFT'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData(1);
			}
			//刷新进度查询列表
			if(window.parent.$("[originname='BUSINESSPROGRESS'].st_tab_branch").find('iframe')[0]) {
				window.parent.$("[originname='BUSINESSPROGRESS'].st_tab_branch").find('iframe')[0].contentWindow.setColAndData(1);
			}
		}else{
			this.nowVue.refrushData&&this.nowVue.refrushData();
		}
	},
	showProgressDialog:function(config){
		var _this=this;
		this.nowVue.dialog = {
			type:"progress",
			title: "批量"+(config.action||"")+"处理进度提示",
			visible: true,
			full: false,
			footer: true,
			width: "450px",
			canClose: true,
			body: 	`<div style="margin:0 auto;padding: 0px calc(50% - 63px);">
						<el-progress type="circle" :percentage="nowProgress"></el-progress>
					</div>`,
			footList: [
				{
					name: 1,
					text: "取消"
				}
			],
			data: {
				nowProgress:0,
				callback: function(event, type) {
					_this.dealAbort(config);
				}
			}
		};
		this.count=0;
		this.uploadProgress(config);
	},
	uploadProgress:function(config){
		var _this=this;
		$.ajax({
			url : config.infoUrl,
			error:function(hrx,msg,ex){
				if(_this.count<=5){
					setTimeout(function(){
						_this.uploadProgress(config);
					},1500);
				}else{
					_this.dealAbort(config,true);
				}
				_this.count++;
			},
			success : function(data) {
				if(data!=null){
					var bOver=false;
					if(data){
						_this.count=0;
						if(data.cancel=='1'){
							_this.nowVue.dialog.visible=false;
							config.onfinish(data,config.action);
							return;
						}
						if(data.cancel=='2'){
							_this.nowVue.dialog.visible=false;
							showError("未查询到可以"+config.action+"的数据,请刷新列表重试");
							return;
						}
						bOver=setProgress(data);
					}else{
						_this.count++;
					}
					//返回值为空时，关闭进度条
					if(_this.count>=5){
						_this.count=0;
						_this.nowVue.dialog.visible=false;
						showError("未查询到可以"+config.action+"的数据,请刷新列表重试");
						return;
					}
					if(!bOver){
						setTimeout(function(){
							_this.uploadProgress(config);
						},1500);
					}
				}else{
					console.log("返回结果为空");
				}
			}
		});
		function setProgress(data){
			var msg="";
			if(data.cancel != null&&data.cancel == '1'){
				_this.nowVue.dialog.visible=false;
				config.onfinish(data,config.action);
				return true;
			}
			if(!data.count)return false;
			if(!data.dealCount)return false;
			var iSta=parseInt(data.dealCount);//已处理任务数
			var iSum=parseInt(data.count);//总任务数
			if(iSum<=0)return true;
			if(iSta>=iSum){
				_this.nowVue.dialog.data.nowProgress=100;
				_this.nowVue.dialog.visible=false;
				config.onfinish(data,config.action);
				return true;
			}
			_this.nowVue.dialog.data.nowProgress=parseInt(iSta/iSum*100);
			return false;
		}
	},
	dealAbort:function(config,flag){//中止提交
		var _this=this;
		_this.nowVue.$set(_this.nowVue.dialog.footList[0], "text", "取消中...");
		flag = flag?true:false;
		_this.nowVue.$set(_this.nowVue.dialog.footList[0], "disable", true);
		$.ajax({
			url:config.abortUrl,
			data:{cancelFlag:flag},
			error:function(hrx,msg,ex){
				$.messager.confirm('提示','你确定要停止吗？',function(r){
				    if (r){
				    	_this.nowVue.visible=false;
						//TODO：展示错误信息
				    	showAjaxError(hrx,msg,ex,"错误信息");
				    }
				});
				_this.nowVue.$set(_this.nowVue.dialog.footList[0], "disable", false);
			},
			success:function(data){
				if(!data && config.action=='提交'){
					_this.dealAbort(config,flag);
				}else{
					_this.nowVue.$set(_this.nowVue.dialog.footList[0], "disable", true);
					_this.nowVue.$set(_this.nowVue.dialog.footList[0], "text", "正在中止...");
				}
			}
		});
	},
	//执行提交的功能操作事件，目前有提交前和提交后操作事件
	submitEvent:function(taskIds,submitEventType){
		var _this=this;
		$.ajax({
			url:"/workflowWebService/getOperationConfigsByTaskIds",
			data:{"taskIds":taskIds.join(',')},
			async:false,
			success:function(operationConfigsMap){
				//逐个任务执行功能操作事件表达式
				for(var i = 0;i < taskIds.length;i++){
					if(operationConfigsMap[taskIds[i]]){
						_this.taskId = taskIds[i];
						_this.businessNumber = operationConfigsMap['JID-'+taskIds[i]];
						_this.processInstanceId = operationConfigsMap['WFRID-'+taskIds[i]];
						var configs = [];
						configs.push(operationConfigsMap[taskIds[i]]);
						//每个任务执行前都重新初始化提交相关的事件表达式集合
						if(submitEventType&&submitEventType.indexOf("Submit")){
							_this.submitEvents = [];
							_this.beforeSubmitEvents = [];
						}
						if(submitEventType=="AfterBackOffice"||submitEventType=="AfterAllback"){
							_this.backOfficeEvents = [];
						}
						//执行表达式前先初始化功能操作事件
						_this.analyzeOperationConfigs(configs,null);
						var dataForm={"JOB_BASE.JID":_this.businessNumber,"JOB_BASE.WFRID":_this.processInstanceId};
						createDataForm(dataForm);
						//提交成功后触发前端功能操作
						if(submitEventType == "BeforeSubmit"){
							//执行提交前功能操作事件
		   					if(!_this.EventBeforeCallback(_this.beforeSubmitEvents,"(列表)提交前")){
		   						console.error("【"+_this.businessNumber+"】提交前事件返回false，该业务已中止提交操作");
		   						taskIds.splice(i,1); 
		   					}
						}else if(submitEventType == "AfterSubmit"){
							//执行提交后功能操作事件
							_this.EventCallback(_this.submitEvents,"(列表)提交后");
						}else if(submitEventType=="AfterBackOffice"||submitEventType=="AfterAllback"){
							//执行收回后功能操作事件
							_this.EventCallback(_this.backOfficeEvents,"收回后");
						}
					}
				}
			},
			error:function(xhr,stat,exmsg){
				showAjaxError(xhr,stat,exmsg,"获取功能操作事件出错");
			}
		});
	},
	showErrorInfo:function(info,action){
		var _this=this;
		var sum = info.count;
		delete info.title;
		delete info.count;
		delete info.dealCount;
		delete info.businessNumber;
		var resultTitle = "批量"+action+"结果";
		if(info.cancel && info.cancel == 1){
			resultTitle = "用户中止提交结果";
		}
		delete info.cancel;
		var untreatedInfo=[];//未处理的任务
		var errInfo=[];//处理失败的任务
		var successInfo=[];//处理成功的任务
		var successCount=0;
		var key=[];
		for(var p1 in info){
			if(info.hasOwnProperty(p1)){
				key.push(p1);
				if(info[p1].status=='2'){//出错
					var err={jid:info[p1].businessNumber,title:info[p1].title,message:analyseError(info[p1].message)}
					errInfo.push(err);
				}
				if(info[p1].status=='1'){//已完成
					successCount++;
					successInfo.push({jid:info[p1].businessNumber,taskId:info[p1].taskId,title:info[p1].title,message:analyseError(info[p1].message)});
				}
				if(info[p1].status=='0' || info[p1].status=='3'){
					untreatedInfo.push({jid:info[p1].businessNumber,taskId:info[p1].taskId,title:info[p1].title,message:'尚未处理'});
				}
			}
		}
		//对提交成功的任务触发提交后前端功能操作事件
		if(successInfo.length>0){
			var taskIds = [];
			for(var i = 0;i < successInfo.length;i++){
				if(successInfo[i].taskId){
					taskIds.push(successInfo[i].taskId);
				}
			}
			if(action=='提交'){
				//执行提交后前端功能操作事件
				_this.submitEvent(taskIds,"AfterSubmit");
			}else if(action=='收回'){
				//执行收回后后前端功能操作事件
				_this.submitEvent(taskIds,"AfterBackOffice");
			}
		}
		if(errInfo.length>0 || untreatedInfo.length>0){
			var dataInfo = errInfo.concat(untreatedInfo);
			var data ={totalCount:dataInfo.length,data:dataInfo};
			this.nowVue.dialog = {
				title: resultTitle+":当前"+sum+"条记录"+action+",成功"+successCount+"条,失败"+errInfo.length+"条,未处理"+(sum-successCount-errInfo.length)+"条",
				visible: true,
				full: false,
				footer: true,
				width: "640px",
				canClose: true,
				body: 	`<div style="margin:0 auto;">
							<i-subData :iData="table" :loadAll="flag0" :footer="flag0" :handlers="eventHander" common="true"></i-subData>
						</div>`,
				footList: [
					{
						name: 1,
						text: "确定"
					}
				],
				data: {
					flag0:false,
					flag1:true,
					table:{
						"prid": "showErrorInfo",
						"domaintype": "subData",//表示类型为子表单
						"rid":"errorInfo",
						"bgcolor": "white",
						"zindex": "36",
						"margin": "0px 0px 0px 0px",
						"width": "600px",
						"height": "289px",
						"stopInit":true,
						"isShowTool":"false",
						"canCheck":"false",
						"fonts":"color:black;font-weight:normal;letter-spacing:0pt;text-decoration:none;font-size:14px;font-family:Microsoft YaHei;font-style:normal;",
						"sortfield":"",
						"security": "readonly,show",
						"fname": "errorInfoTable",
						"prefix": "S-ERR-",
						"linkTplId": "",
						"columns":[
							{
								"name": "jid",
								"width": "150",
								"label": "业务受理号",
								"type": "label",
								"control": {}
							},
							{
								"name": "message",
								"width": "450",
								"label": "错误原因",
								"type": "label",
								"control": {}
							}
						]
					},
					eventHander:{//使表格行点击和双击事件失效 并执行以下方法
						getData:function(item,event){
							return data;
						}
					},
					callback: function(event, type) {
						_this.nowVue.dialog.visible=false;
						_this.reloadDatagrid();
					}
				}
			};
			_this.nowVue.$nextTick(function(){
				getComponent("errorInfoTable").context.refrushData();
			});
		}else{
			_this.nowVue.$SgNotice.success({
				title: resultTitle,
				desc:"已"+action+"成功"+successCount+"条记录"
			});
			_this.reloadDatagrid();
		}
	},
	//批量提交一条或多条数据
	submitDatas:function(taskIds,info){
		var _this=this;
		if(taskIds.length==1){
			$.ajax({
				//获取当前提交任务的功能操作事件
    			url:"/workflowWebService/getOperationConfigsByTaskIds",
    			data:{taskIds:encodeURIComponent(taskIds[0])},
				success:function(data){
					var configs = [];
 					configs.push(data[taskIds[0]]);
 					_this.taskId=taskIds[0];
 					//每个任务执行前都重新清空提交相关的事件表达式集合
 					_this.beforeSubmitEvents = [];
 					_this.readySubmitEvents = [];
					_this.submitEvents = [];
 					//执行表达式前先初始化功能操作事件
 					_this.analyzeOperationConfigs(configs,null);
 					_this.businessNumber = info[0]["job_base-jid"];
 					_this.processInstanceId = info[0]["job_base-wfrid"];
					var dataForm={"JOB_BASE.JID":_this.businessNumber,"JOB_BASE.WFRID":_this.processInstanceId};
					createDataForm(dataForm);
					//执行提交前事件
					if(!_this.EventBeforeCallback(_this.beforeSubmitEvents,"(列表)提交前")){
						console.error("提交前事件返回false，已中止提交操作");
						return;
					}
					$.ajax({
		    			url:"/workflowWebService/submitListTask",
		    			data:{taskId:encodeURIComponent(taskIds[0]),jid:info[0]["job_base-jid"]},
	    				success:function(data){
	    					//data.message不为空，表示已完成提交
		   			        if (data.message) {//如果有消息内容，说明已提交成功，不需要显示提交对话框
		   			        	_this.submitComplete(taskIds[0],"-1");
		   			        }else{
		   			        	_this.showCompleteDialogData(data,taskIds[0],"-1");
		   			        }
		    			},
		    			error:function(xhr,stat,exmsg){
		    				showAjaxError(xhr,stat,exmsg,"获取功能操作事件出错");
		    			}
					});
				},
    			error:function(xhr,stat,exmsg){
    				showAjaxError(xhr,stat,exmsg,"提交出错");
    			}
			});
		}else{
			//批量执行提交前前端功能操作事件
			this.submitEvent(taskIds,"BeforeSubmit");
			//批量提交
			$.ajax({
    			url:"/workflowWebService/removeBatchOperationCache",
				data:{"cacheKey":"batchComplate_Status_"},
				success:function(data){
					//调用批量处理提示方法
		 			_this.showProgressDialog({
						action:"提交",
						infoUrl:"/workflowWebService/getBatchComplateStatus",
						abortUrl:"/workflowWebService/cancelBatchComplate",
						onfinish:function(info,action){
							_this.showErrorInfo(info,action);
						}
					});
					$.ajax({
					    url:"/workflowWebService/batchDivideGroup",
				    	data:{"taskIds":taskIds.join(',')},
				    	success:function(data){
							_this.dealCompleteDialog(data);
					    }
					});
    			}
	    	});
		}
	},
	dealCompleteDialog: function(code){
		var _this=this;
		$.ajax({
		    url:"/workflowWebService/batchComplateTask",
		    type: 'GET',
	    	data:{'code':code},
	    	success:function(data){
				if(data.code){
					_this.createCompleteDialog(data,data.taskId,data.code);
				}
			},
			error: function(xhr,stat,exmsg){
				_this.nowVue.dialog.visible=false;
				showAjaxError(xhr,stat,exmsg,"");
			}	
		});
	},
	showCompleteDialogData:function(data,taskId,code){
		var _this=this;
		this.notReadySubmitEvents = [];
	  	//初始化未执行准备提交前端事件变量
	  	for(var i=0;i < this.readySubmitEvents.length;i++){
		  	this.notReadySubmitEvents.push(this.readySubmitEvents[i]);
	  	}
		if(code && code != "-1") { //不为空且不是-1，表示批量提交处理，-1表示工作列表单个提交
			this.createCompleteDialog(data, taskId, code);
		} else {
			if(data == null) return;
			var sResult = "";
			var chPrefix = "";
			if(data.result) {
				sResult = (data.result + "");
			}
			if(sResult.length > 0) {
				chPrefix = sResult.charAt(0);
			}
			if(chPrefix == '?' || chPrefix == '？') { //如果是阻止结果（以!开头的，已抛出异常，不需要在此处理）
				this.nowVue.$confirm(data.result.substring(1) + ",是否需要继续提交？", '提示', {
					cancelButtonText: '取消',
					confirmButtonText: '确定',
					type: 'warning'
				}).then(function(){
					_this.readySubmitComplete(data, taskId, code);
				}).catch(function(){});
			} else {
				_this.readySubmitComplete(data, taskId, code);
			}
		}
	},
	readySubmitComplete:function(data, taskId, code){
		var _this=this;
		if(!data)
			data=$.Data;
		//执行准备提交前前端事件
		if(this.notReadySubmitEvents && this.notReadySubmitEvents.length > 0){
			//传入提交数据给表达式获取
			$.Data = data;
			var exp=this.notReadySubmitEvents.shift();
			this.EventReadySubmitCallback(exp,"准备提交");
		}else{
			if (data.showDialog)
				this.createCompleteDialog(data, taskId, code);
			else{
				this.nowVue.loading=true;
				this.nowVue.$nextTick(function(){
					//发送ajax请求，完成后续提交请求
			        $.ajax({
			            url: "/workflowWebService/autoComplateTask",
			            data: {"taskId": taskId,beforCheck:false},
			            success: function(data, type) {
			            	_this.nowVue.loading=false;
			                _this.submitComplete(taskId, code);
			            },
			            error: function(xhr,stat,exmsg){
			            	_this.nowVue.loading=false;
			            	showAjaxError(xhr,stat,exmsg,"提示");
			            }
			        });
				});
			}
		}
	},
	createCompleteDialog:function(data, taskId, code){
		var _this=this;
		this.taskId=taskId;
		var subTasks = data.subTask;
		subTasks.sort(function(param1, param2){
			return param1.mDefinitionName.localeCompare(param2.mDefinitionName,"zh");
		});
		this.userInfos = data.userInfos;
		var emergencyLevel = false;
		if(data.emergencyLevel) {
			if(data.emergencyLevel == 1)
				emergencyLevel = true;
		}
		if(!taskId) {
			taskId = '';
		}
		if(!code) {
			code = '';
		}
		var dialogTitle = '选择办理人';
		//列表提交对话框标题显示业务定义名称+流程版本名，区分批量提交分组对话框
		if(data.dialogTitle) {
			dialogTitle += '(' + data.dialogTitle + ')';
		}
		var flag = true,slideMenu=[],defaultCheck=[],selectTab=[];
		for(var i = 0; i < subTasks.length; i++) {
			var linkKey = subTasks[i].mDefinitionKey;
			this.definitionInfo[linkKey] = subTasks[i];
			var item={};
			if(subTasks[i].taskInstType == 'EndNoneEvent') {
				item={
					label:"结束（事件）",
					value:subTasks[i].taskInstType,
					data:subTasks[i]
				};
			} else {
				var parallelSubmitSelect = false;
				//判断并行网关的多条流程线是否有任意一条勾选了【提交时可选择】属性，若是则同组的并行网关环节都允许选择改变
				if(subTasks[i].upLinkType == 3) {
					for(var j = 0; j < subTasks.length; j++) {
						if(subTasks[j].upLinkType == 3 && subTasks[j].groupName == subTasks[i].groupName &&
							subTasks[j].submitSelect) {
							parallelSubmitSelect = true;
							break;
						}
					}
				}
				if(subTasks[i].submitSelect || parallelSubmitSelect) {
					if(subTasks.length == 1) {
						item={
							label:subTasks[i].mDefinitionName,
							value:subTasks[i].mDefinitionKey,
							data:subTasks[i]
						};
						defaultCheck.push(subTasks[i].mDefinitionKey);
					} else if(subTasks.length != 1) {
						if(subTasks[i].groupName) {
							item={
								label:subTasks[i].mDefinitionName,
								value:subTasks[i].mDefinitionKey,
								name:subTasks[i].groupName,
								data:subTasks[i]
							};
						} else {
							item={
								label:subTasks[i].mDefinitionName,
								value:subTasks[i].mDefinitionKey,
								data:subTasks[i]
							};
						}
					}
				} else {
					if(subTasks[i].groupName) {
						item={
							label:subTasks[i].mDefinitionName,
							value:subTasks[i].mDefinitionKey,
							name:subTasks[i].groupName,
							data:subTasks[i],
							disabled:true
						};
						defaultCheck.push(subTasks[i].mDefinitionKey);
					} else {
						item={
							label:subTasks[i].mDefinitionName,
							value:subTasks[i].mDefinitionKey,
							data:subTasks[i],
							disabled:true
						};
						defaultCheck.push(subTasks[i].mDefinitionKey);
					}
				}
				var obj = {
					"masterMens": subTasks[i].masterMen,
					"normalMens": subTasks[i].normalMen,
					"chooter": "",
					"emergencyLevel": data.emergencyLevel,
					"resion": ""
				};
				this.submitData[subTasks[i].mDefinitionKey] = obj;
				slideMenu.push(item);
			}
			if(flag) {
				// 默认展示第一个环节的提交对话框信息
				this.link = linkKey;
				selectTab=this.linkDefinitionInfo(linkKey);
				flag = false;
			}
		}
		this.yzhlList["applyReason"]=true;
		this.nowVue.dialog = {
			id:"personSelect",
			title: dialogTitle,
			visible: true,
			full: false,
			footer: true,
			width: "750px",
			canClose: true,
			body: `<el-container style="height: 500px; border: 1px solid #eee">
					  	<el-aside width="200px" style="border-right:1px solid rgb(238, 238, 238);">
					  		<div style="padding:5px 20px;">下一环节</div>
						    <el-tree
							  	:data="slideMenu"
							  	show-checkbox
							  	ref="tree"
							  	node-key="value"
							  	@current-change="currentChange"
							  	@check-change="checkChange"
							  	default-expand-all
							  	:highlight-current="highlight"
							  	:default-checked-keys="defaultCheck">
							</el-tree>
					  	</el-aside>
					  	<el-container>
						    <el-main style="overflow:hidden;">
						      	<el-tabs type="card" class="tabBefore">
						      		<el-tab-pane 
						      			v-for="(item,index) in selectTab"
						      			:key="item.label"
						      			:label="item.label">
						      			<el-tree
										  	:data="item.data"
										  	:ref="item.ref"
										  	show-checkbox
										  	node-key="userId"
										  	default-expand-all
										  	:highlight-current="highlight"
										  	:default-checked-keys="item.selec">
						      				<span class="custom-tree-node" slot-scope="scope">
										        <span>{{ scope.data.userName }}</span>
										        <span>{{ scope.data.userStact }}</span>
									      	</span>
										</el-tree>
						      		</el-tab-pane>
								</el-tabs>
								<span style="margin-top:5px;display:block;">注意事项</span>
								<i-input :iData="reason" v-model="value" common="true"></i-input>
						    </el-main>
					  	</el-container>
					</el-container>`,
			footList: [
				{
					name: 0,
					type:"checkbox",
					text: "紧急",
					value:emergencyLevel
				},
				{
					name: 1,
					text: "提 交"
				}
			],
			data: {
				value:"",
				slideMenu: slideMenu,
				defaultCheck:defaultCheck,
				selectTab:selectTab,
				highlight:true,
				reason:{
					"fname": "applyReason",
					"security": "notnull,edit",
					"multiline": "true",
					"zindex": "",
					"width": "489px",
					"height": "50px",
					"margin": "0px 0px 0px 0px",
					"fonts": ""
				},
				checkChange:function(arg1,isChecked){
					_this.submitBeforeSave();
					_this.nowVue.dialogComponent.$refs.tree.setCurrentKey(arg1.value);
					_this.nowVue.dialogComponent.selectTab=_this.linkDefinitionInfo(arg1.value);
				},
				currentChange:function(arg1,arg2){
					_this.submitBeforeSave();
					_this.nowVue.dialogComponent.selectTab=_this.linkDefinitionInfo(arg1.value);
				},
				callback: function(event, type) {
					_this.checkSubmit(this, code);
				}
			}
		};
		this.nowVue.$nextTick(function() {
			this.dialogComponent.$refs.tree.setCurrentKey(slideMenu[0].value);
		});
	},
	linkDefinitionInfo:function(index){
		if(index != this.link)
		this.submitBeforeSave(index);
		this.link = index;
		var result=[];
		var _this=this;
		if(this.definitionInfo[index].masterMen.length > 0) {
			var masterMens = [];
			var _masterMenList = this.definitionInfo[index].masterMen;
			if(!this.definitionInfo[index].countersign) {
				_masterMenList = this.definitionInfo[index].masterMen.concat(this.definitionInfo[index].normalMen);
			}
			for(var i = 0; i < _masterMenList.length; i++) {
				var value = _masterMenList[i];
				let item={
					userId: value,
					userName: this.userInfos[value]?this.userInfos[value].organInfo.organName:"用户名不存在，可能已被删除",
					userStact: "离职",
					iconCls: 'icon-man',
					number: this.userInfos[value]?(this.userInfos[value].count||0):0
				};
				if(this.userInfos[value] && this.userInfos[value].organInfo) {
					if(this.userInfos[value].organInfo.status == 1 || this.userInfos[value].organInfo.status == 2) {
						item.userStact="在职";
					}
				}
				if(item.userStact == "离职") {
					continue;
				}
				var fullNames = this.userInfos[value].fullName.split("/");
				if(fullNames.length <= 1) {
					masterMens.push(item);
				} else {
					var inx = 0;
					var leafCont = this.addUserParentNode(masterMens, inx, fullNames);
					leafCont.push(item);
				}
			}
			//将多个单节点合并成一个
			if( masterMens.length > 0) {
				masterMens = this.mergeNode(masterMens, "");
				if(masterMens.length > 1) {
					var allNode = [];
					var an = {
						userId: "alldept",
						userName: "所有部门",
						userStact: "",
						iconCls: 'icon-dept',
						number: "",
						children: masterMens
					}
	
					allNode.push(an);
					masterMens = allNode;
				}
			}
			let selectMen=[];
			if(this.submitData[index]) {
				selectMen = this.submitData[index].masterMens;
			} else {
				if(this.definitionInfo[index].completingToAll) {
					selectMen=[masterMens[0].userId]
				}
				if(!this.definitionInfo[index].countersign) {
					selectMen=this.definitionInfo[index].masterMen;
				}
			}
			result.push({
				ref:"main",
				label:"主要处理人",
				data:masterMens,
				selec:selectMen
			});
		}
		
		if(this.definitionInfo[index].countersign && this.definitionInfo[index].normalMen.length > 0) {
			var normalMens = [];
			for(var i = 0; i < this.definitionInfo[index].normalMen.length; i++) {
				var value = this.definitionInfo[index].normalMen[i];
				let item={
					userId: value,
					userName: this.userInfos[value]?this.userInfos[value].organInfo.organName:"用户名不存在，可能已被删除",
					userStact: "离职",
					iconCls: 'icon-man',
					number: this.userInfos[value]?(this.userInfos[value].count||0):0
				};
				if(this.userInfos[value].organInfo.status == 1 || this.userInfos[value].organInfo.status == 2) {
					item.userStact = "在职";
				}
				if(item.userStact == "离职") {
					continue;
				}
				var fullNames = this.userInfos[value].fullName.split("/");
				if(fullNames.length <= 1) {
					normalMens.push(item);
				} else {
					var inx = 0;
					var leafCont = this.addUserParentNode(normalMens, inx, fullNames);
					leafCont.push(sub);
				}
			}
			//将多个单节点合并成一个
			if( normalMens.length > 0) {
				normalMens = this.mergeNode(normalMens, "");
				if(normalMens.length > 1) {
					var allNode = [];
					var an = {
						userId: "alldept",
						userName: "所有部门",
						userStact: "",
						iconCls: 'icon-dept',
						number: "",
						children: normalMens
					}
					allNode.push(an);
					normalMens = allNode;
				}
			}
			let selectMen=[];
			//选择数据
			if(this.submitData[index]) {
				selectMen = this.submitData[index].normalMens;
			} else if(this.definitionInfo[index].completingToAll) {
				selectMen= [normalMens[0].userId];
			}
			result.push({
				ref:"common",
				label:"普通处理人",
				data:normalMens,
				selec:selectMen
			});
		}
		
		if(this.definitionInfo[index].choosingOthers) {
			var _url='/mainWeb/system/getOrganTree?valid=1&type=2';
			$.ajax({
				url:_url,
				type:"POST",
				async: false,
				dataType:"json",
				success:function(data){
					var arr=[];
					for(let i=0,len=data.length;i<len;i++){
						var item={
							userId: data[i].id=="#"?"alldept":data[i].id,
							userName: data[i].text,
							userStact: "离职",
							iconCls: data[i].iconCls,
							number: data[i].id=="#"?"":(_this.userInfos[data[i].id]?(_this.userInfos[data[i].id].count||0):0),
							children:[]
						}
						if(data[i].attributes.status == 1 || data[i].attributes.status == 2) {
							item.userStact = "在职";
						}
						sortData(item,data[i].children);
						arr.push(item);
					}
					
					function sortData(data,arr){
						for(let i=0,len=arr.length;i<len;i++){
							var item={
								userId: arr[i].id=="#"?"alldept":arr[i].id,
								userName: arr[i].text,
								userStact: "离职",
								iconCls: arr[i].iconCls,
								number: arr[i].id=="#"?"":(_this.userInfos[arr[i].id]?(_this.userInfos[arr[i].id].count||0):0),
								children:[]
							}
							if(arr[i].attributes.status == 1 || arr[i].attributes.status == 2) {
								item.userStact = "在职";
							}
							if(arr[i].children&&arr[i].children.length){
								sortData(item,arr[i].children);
							}
							data.children.push(item);
						}
					}
					
					result.push({
						ref:"other",
						label:"另选处理人",
						data:arr,
						selec:[]
					});
				},
				error:function(xhr){
					showError('组织结构数据获取失败',"提示");
				}
			});
		}
		return result;
	},
	//提交对话框内“提交”按钮绑定事件处理方法
	checkSubmit:function(com, code){
		var _this=this;
		this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", true);
		this.submitBeforeSave(code);
		var val_payPlatform = com.$refs.tree.getCheckedKeys();
		var resion = com.value;
		if(val_payPlatform == null || val_payPlatform.length <= 0) {
			this.nowVue.$SgNotice.error({
				title: "最少选择一个路由方向"
			});
			this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", false);
			return false;
		}
		var checkedData = {};
		var emergencyLevel = this.nowVue.dialog.footList[0].value?1:0;
		for(var temp = 0; temp < val_payPlatform.length; temp++) {
			var inputValue = val_payPlatform[temp];
			if(inputValue == 'EndNoneEvent') { //如果选择了结束分支，结档
				this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", false);
				this.nowVue.$set(this.nowVue.dialog, "visible", false);
				this.showFinishDialogSaveData(true);
				return;
			}
		}
		
		for(var temp = 0; temp < val_payPlatform.length; temp++) {
			var inputValue = val_payPlatform[temp];
			if((this.submitData[inputValue].chooter == null || this.submitData[inputValue].chooter == "") &&
				((this.submitData[inputValue].masterMens == null || this.submitData[inputValue].masterMens.length <= 0) &&
					(this.submitData[inputValue].normalMens == null || this.submitData[inputValue].normalMens.length <= 0))) {
				this.nowVue.$SgNotice.error({
					title: "选中的环节必须要填写处理人"
				});
				this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", false);
				return;
			}
			var obj = {
				"masterMens": this.submitData[inputValue].masterMens,
				"normalMens": this.submitData[inputValue].normalMens,
				"chooter": this.submitData[inputValue].chooter,
				"emergencyLevel": emergencyLevel,
				"resion": resion
			};
			checkedData[inputValue] = obj;
		}
		var testJson = JSON.stringify(checkedData);
		var submitdata = {
			taskId: this.taskId,
			submitData: testJson,
			isSubmitAll: this.countersign,
			beforCheck: false
		};
		//code不为空且不为-1则表示是批量提交处理，code为-1定义为工作列表单个提交，不作为批量提交处理
		if(code != null && code.length > 0 && code != "-1") {
			submitdata = {
				code: code,
				submitData: testJson,
				isSubmitAll: this.countersign,
				beforCheck: false
			};
		} else if(!this.taskId) {
			startProcessDefinition(testJson);
			this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", false);
			this.nowVue.$set(this.nowVue.dialog, "visible", false);
			return;
		}
		if( this.countersign) {
			//询问是否提交给到下一个环节
			this.nowVue.$confirm('还有人没有会签，你是否强行提交到下一环节?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function() {
				submitdata.isSubmitAll = true;
				_this.batchComplateTask(submitdata, function(datas) {
					if(datas.code && datas.subTask) { //批量提交时，如果此批已处理，需要显示下一批工作的提交对话框
						_this.showCompleteDialogData(datas, _this.taskId, datas.code);
						return;
					}
					if(_this.taskId) {
						_this.submitComplete(_this.taskId, code);
					}
				});
			}).catch(function() {
				submitdata.isSubmitAll = false;
				_this.batchComplateTask(submitdata, function(datas) {
					if(datas.code && datas.subTask) { //批量提交时，如果此批已处理，需要显示下一批工作的提交对话框
						_this.showCompleteDialogData(datas, _this.taskId, datas.code);
						return;
					}
					if(_this.taskId) {
						_this.submitComplete(_this.taskId, code);
					}
				});
			});
		} else {
			_this.batchComplateTask(submitdata, function(datas) {
				if(datas.code && datas.subTask) { //批量提交时，如果此批已处理，需要显示下一批工作的提交对话框
					_this.showCompleteDialogData(datas, _this.taskId, datas.code);
					return;
				}
				if(_this.taskId) {
					_this.submitComplete(_this.taskId, code);
				}
			});
		}
		this.nowVue.$set(this.nowVue.dialog.footList[1], "disable", false);
		this.nowVue.$set(this.nowVue.dialog, "visible", false);
	},
	batchComplateTask: function(submitdata,callback){
		var _this=this;
		this.nowVue.loading = true;
		this.nowVue.$nextTick(function() {
			$.ajax({
				url: "/workflowWebService/batchComplateTask",
				context: document.body,
				type: 'POST',
				asyn: false,
				dataType: "json",
				data: submitdata,
				success: function(data, type) {
					_this.nowVue.loading = false;
					callback && callback(data);
				},
				error: function(xhr, stat, exmsg) {
					_this.nowVue.loading = false;
					showAjaxError(xhr,stat,exmsg,"提示");
				}
			});
		});
	},
	submitBeforeSave: function(index){
		var masterMens = [];
		var normalMens = [];
		var chooter = "";
		if(this.nowVue.dialog.id=="personSelect"){
			var master=this.nowVue.dialogComponent.$refs.main;
			if(master){
				var MasterPeople=master[0].getCheckedNodes();
				for(var i = 0; MasterPeople.length > i; i++) {
					if((MasterPeople[i].userId != null || MasterPeople[i].userId != "") && MasterPeople[i].iconCls == "icon-man") {
						masterMens.push(MasterPeople[i].userId);
					}
				}
			}
			var common=this.nowVue.dialogComponent.$refs.common;
			if(common){
				var NormalPeople =common[0].getCheckedNodes();
				for(var i = 0; NormalPeople.length > i; i++) {
					if((NormalPeople[i].userId != null || NormalPeople[i].userId != "") && NormalPeople[i].iconCls == "icon-man") {
						normalMens.push(NormalPeople[i].userId);
					}
				}
			}
			var other=this.nowVue.dialogComponent.$refs.other;
			if(other) {
				var orgNode =other[0].getCheckedNodes();
				var ids = [];
				for(var i = 0; orgNode.length > i; i++) {
					if(orgNode[i].userId != null || orgNode[i].userId != "") {
						ids.push(orgNode[i].userId);
					}
				}
				if(ids.length > 0)
					chooter = ids.join(",")
			};
		}
		var obj = {
			"masterMens": masterMens,
			"normalMens": normalMens,
			"chooter": chooter
		};
		this.submitData[this.link] = obj;
	},
	showFinishDialogSaveData: function(isForceFinish){
		var _this=this;
		var param =  {
			taskId: this.taskId,
			isCheckInquiry:true //提交前表达式是否?开头的计算表达式值也表示为不通过
		};
		if(isForceFinish){
		  	param = {taskId: taskId, isForceFinish:true,isCheckInquiry:true};
		}
		/*if(isRecordModifyData){
			var changeData=getDifferentData();
			if(JSON.stringify(changeData)!="{}"){
				param["modifyDataJson"]=JSON.stringify(changeData);
			}
		}*/
		this.nowVue.loading = true;
		this.nowVue.$nextTick(function() {
			$.ajax({
				url: "/workflowWebService/finishProcessInstanceByTaskId",
				type: 'POST',
				dataType: "json",
				data: param,
				success: function(mes, type) {
					_this.nowVue.loading = false;
					if(mes && mes.stack == 'success') {
						if(!EventBeforeCallback(saveBeforeEvents, "保存前")) {
							_this.nowVue.$SgNotice.error({
								title: '保存前事件返回false，将中止结档操作'
							});
							return;
						}
						//刷新工作列表的表格数据
						_this.reloadDatagrid();
						//(3)保存后前端功能操作
						_this.EventCallback(saveEvents, "保存后");
						//(2)提交后
						_this.EventCallback(submitEvents, "提交后");
						//(1)办结成功后出发前端功能操作
						_this.EventCallback(finishEvents, "结档后");
						//可能会关闭选项卡所以需要使用parentWin来显示提示消息
						_this.nowVue.$SgNotice.success({
							title: "结档操作成功"
						});
						//关闭选项卡
						_this.flushWorkTabs();
					} else if(mes.stack == 'query') {
						_this.nowVue.$confirm((mes.message || "提交前检查存在疑问") + ",你确定要结档吗？", '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						}).then(function(){
							_this.finishProcessInstanceByTaskId(isForceFinish);
							return;
						}).catch(function(){});
					} else if(mes.stack == 'error') {
						var msg = mes.message;
						if(!msg) msg="结档出现未知错误";
						showError(msg);
					}
				},
				error: function(xhr, stat, exmsg) {
					_this.nowVue.loading = false;
					showAjaxError(xhr,stat,exmsg,"提示");
				}
			});
		});
	},
	finishProcessInstanceByTaskId:function(isForceFinish){
		var _this=this;
		_this.nowVue.loading = true;
		_this.nowVue.$nextTick(function() {
			//(1)结档前事件【未实现】
			//(2)提交前事件【未实现】
			//(3)保存前事件
			if(!_this.EventBeforeCallback(saveBeforeEvents, "保存前")) {
				_this.nowVue.loading = false;
				_this.nowVue.$SgNotice.error({
					title: '保存前事件返回false，将中止结档操作'
				});
				return;
			}
			var psData = new FormData();
			/*for(name in vue.rsValue) {
				psData.append(name, vue.rsValue[name]);
			}*/
			psData.append("taskId", _this.taskId);
			psData.append("isSaveData", "noSaveData");
			psData.append("isCheckInquiry", false);
			if(isForceFinish) {
				psData.append("isForceFinish", true);
			}
			$.ajax({
				url: "/workflowWebService/finishProcessInstanceByTaskId",
				type: 'POST',
				dataType: "json",
				data: psData,
				success: function(mes, type) {
					_this.nowVue.loading = false;
					if(mes && mes.stack == 'error') {
						_this.nowVue.$SgNotice.error({
							title: mes.message
						});
					} else {
						//刷新工作列表的表格数据
						_this.reloadDatagrid();
						//(3)保存后前端功能操作
						_this.EventCallback(saveEvents, "保存后");
						//(2)提交后
						_this.EventCallback(submitEvents, "提交后");
						//(1)办结成功后出发前端功能操作
						_this.EventCallback(finishEvents, "结档后");
						//可能会关闭选项卡所以需要使用parentWin来显示提示消息
						_this.nowVue.$SgNotice.success({
							title: '结档操作成功'
						});
						//关闭选项卡
						_this.flushWorkTabs();
					}
				},
				error: function(xhr, stat, exmsg) {
					_this.nowVue.loading = false;
					showAjaxError(xhr,stat,exmsg,"提示");
				}
			});
		});
	},
	addUserParentNode: function(nodes, istart, fullNames){
		if(istart + 1 >= fullNames.length) return nodes; //最后一个节点不用处理
		var name = fullNames[istart];
		var nodeidname = fullNames[istart - 1];
		nodeidname = nodeidname + name;
		var childNodes = null;
		for(var inx = 0; inx < nodes.length; ++inx) {
			if(nodes[inx] && nodes[inx].userName == name) {
				childNodes = nodes[inx].children;
				break;
			}
		}
		if(childNodes == null) {
			var sub = {
				userId: nodeidname,
				userName: name,
				userStact: "",
				iconCls: 'icon-dept',
				number: "",
				children: []
			};
			childNodes = sub.children;
			nodes.push(sub);
		}
		return this.addUserParentNode(childNodes, ++istart, fullNames);
	},
	submitComplete: function(taskId, code){
		//code为-1定义为工作列表单个提交，不作为批量提交处理，则无需关闭选项卡
		if(code == "-1") {
			this.nowVue.$SgNotice.success({
				title: '提交操作成功'
			});
			//刷新工作列表的表格数据
			this.reloadDatagrid();
			//提交成功后触发前端功能操作
			this.EventCallback(this.submitEvents, "(列表)提交后");
		} else {
			this.nowVue.$SgNotice.success({
				title: '提交操作成功'
			});
			//刷新工作列表的表格数据
			this.reloadDatagrid();
			//TODO:从data得到是否结档状态
			var bArch = false;
			var isOk = this.fireSubmitAfter(taskId, bArch);
			//关闭选项卡
			if(isOk){
		    	//关闭选项卡
			    this.flushWorkTabs();
		    }
		}
	},
	/*催办功能*/
	urgeByRid: function(row){
		var _this=this;
		this.yzhlList["newMessage"]=true;
		this.nowVue.dialog = {
			title: "确认催办",
			visible: true,
			full: false,
			footer: true,
			width: "400px",
			canClose: true,
			body: `<div>
					<label for='newMessage'>请输入催办信息：</label>
					<i-input :iData='newMessage' v-model='value' common='true'></i-input>
				</div>`,
			footList: [{
				name: 0,
				text: "提 交"
			}],
			data: {
				value: "",
				newMessage: {
					"fname": "newMessage",
					"security": "notnull,edit",
					"multiline": "true",
					"z-index": "",
					"width": "360px",
					"height": "60px",
					"margin": "0px 0px 0px 0px",
					"font": {}
				},
				callback: function(event, type) {
					if(!this.value) {
						_this.nowVue.$SgMessage.error("请输入催办原因");
						return;
					}
					var sFn = function(data){
						_this.nowVue.$SgNotice.success({
							title: '催办成功'
						});
						_this.nowVue.dialog.visible=false;
						_this.reloadDatagrid();
					};
					var fFn = function(xhr,err,exmsg){
						_this.nowVue.dialog.visible=false;
						showAjaxError(xhr,err,exmsg,"催办失败");
					};
					_this.invokeJson("/workflowWebService/remindWfrId",{wfrId:row["job_base-wfrid"],message:this.value},{sFn:sFn,fFn:fFn});
				}
			}
		};
	},
	refuseSuspension:function(taskId){
		var _this=this;
		this.yzhlList["Suspension"]=true;
		this.nowVue.dialog = {
			title: "拒绝挂起",
			visible: true,
			full: false,
			footer: true,
			width: "400px",
			canClose: true,
			body: `<div>
					<label for='Suspension'>请输入拒绝挂起原因：</label>
					<i-input :iData='Suspension' v-model='value' common='true'></i-input>
				</div>`,
			footList: [{
				name: 0,
				text: "确定"
			}],
			data: {
				value: "",
				Suspension: {
					"fname": "Suspension",
					"security": "notnull,edit",
					"multiline": "true",
					"z-index": "",
					"width": "360px",
					"height": "60px",
					"margin": "0px 0px 0px 0px",
					"font": {}
				},
				callback: function(event, type) {
					if(!this.value) {
						_this.nowVue.$SgMessage.error("拒绝挂起原因不为空");
						return;
					}
					var sFn = function(data){
						_this.nowVue.$SgNotice.success({
							title: '拒绝挂起成功'
						});
						_this.nowVue.dialog.visible=false;
						_this.reloadDatagrid();
					};
					var fFn = function(xhr,err,exmsg){
						_this.nowVue.dialog.visible=false;
						showAjaxError(xhr,err,exmsg,"拒绝挂起错误");
					};
					_this.invokeJson("/workflowWebService/applySupervisionNotPass",{taskId:taskId,appllyAudit:this.value},{sFn:sFn,fFn:fFn});
				}
			}
		};
	}
}


export const workFlow=new workflow();