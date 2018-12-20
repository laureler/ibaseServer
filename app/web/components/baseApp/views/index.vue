<template>
	<div class="main">
		<div v-show="cl_Tb_Pane_Show" :style="cl_Tb_Pane_Style" id="close-tabs-pane" @click="closeTabsPane">
			<div class="current">关闭当前标签</div>
			<div class="others">关闭其他标签</div>
			<div class="all">关闭所有标签</div>
		</div>
		<div class="header" id="header">
			<div v-show="headExpand">
				<div class="left-title">{{sysTitle}}<span>{{sysTitleS}}</span></div>
				<ul class="right-login">
					<li class="person-name">{{userName}}</li>
					<!--<li class="home"></li>-->
					<li class="setting"></li>
					<li class="help"></li>
					<li class="split-loginOut"><span></span></li>
					<li class="login-out" @click="handleCommand('exit')"></li>
				</ul>
			</div>
			<i :class="headExpand?'head-expand-btn':'head-expand-btn head-expand-btn-close'" @click="expandHead()"></i>
		</div>
		<div class="first-nav" ref="headerNav">
			<!--<span class="title" @click="addTab(homePageItem)" :class="'title' menu.firstActiveI==index?' is-active':''">首页</span>-->
			<ul class="nav-list" ref="navList">
				<li v-for="(item,index) in menuList" @click="switchMenu(item, index)" :class="menu.firstActiveI==index?'is-active':''" :style="item.moduleId=='mainUrl'?'font-weight: bold;':''">
					{{item.name}}
				</li>
			</ul>
		</div>
		<div :class="headExpand?'content-box':'content-box head-close'">
			<!-- 二级菜单 -->
			<div class="nav" v-if="secondMenu && secondMenu.length>0">
				<div v-show="!isCollapse" class="expand">
					<ul>
						<li v-for="(item,index) of secondMenu" :index="item.moduleId" :key="index" @click="switchSecdMenu(item, index)" :class="menu.secdActiveI==index && wrapType==1?'active':''">
							<i class="secd-icon" :style="item.imageUrl?'background-image: url('+item.imageUrl+');':''"></i>
							<p slot="title">{{item.name}}</p>
							<span v-if="item.totalNumber" class="myStar secondStar">{{parseTotal(item.totalNumber)}}</span>
							<!--<span class="myStar secondStar">44</span>-->
						</li>
					</ul>
				</div>
				<div v-show="isCollapse" class="unexpand">
					<ul v-for="(item,index) of secondMenu">
						<li @click="switchSecdMenu(item, index)" :class="menu.secdActiveI==index && wrapType==1?'active':''">
							<i class="nav-icon" :style="item.imageUrl?'background-image: url('+item.imageUrl+');':''"></i>
							<span slot="title">{{item.name}}</span>
							<span v-if="item.totalNumber" class="myStar secondStar">{{parseTotal(item.totalNumber)}}</span>
							<!--<span class="myStar secondStar">555</span>-->
						</li>
					</ul>
				</div>
				<div :class="isCollapse?'isCollapse collapse-btn':'collapse-btn'" @click="isCollapse=!isCollapse">{{isCollapse?'':'收起侧边栏'}}</div>
			</div>
			<div id="right-pane" class="right-pane">
				<div>
					<template v-if="wrapType==1">
						<!-- 三级菜单 -->
						<ul class="third-nav" v-if="thirdMenu && thirdMenu.length>0">
							<li v-for="(item,index) in thirdMenu" @click="switchThirdMenu(item,index)" :class="menu.thirdActiveI==index?'active':''">
								<p>{{item.name}}</p>
								<span v-if="item.totalNumber" class="myStar thirdStar">{{parseTotal(item.totalNumber)}}</span>
								<!--<span class="myStar thirdStar">555</span>-->
							</li>
						</ul>
						<div v-if="tabsList && tabsList.length==1" class="wrapType1__content">
							<tab-cont :moduleId="tabsList[0].moduleId" :pageUrl="tabsList[0].pageUrl" :position="tabsList[0].position" :isShow="tabsList[0].isShow" :splitCont="tabsList[0].splitCont" :pageType="tabsList[0].pageType" :isDialog="tabsList[0].isDialog" :cfgKey="tabsList[0].cfgKey">
							</tab-cont>
						</div>
					</template>
					<template v-else>
						<el-tabs class="tabs" v-if="tabsList" v-model="activeModuleId" type="card" closable @tab-remove="removeTab">
							<el-tab-pane :key="item.moduleId" v-for="(item, index) in tabsList" :label="item.title" :name="item.moduleId" :ref="item.moduleId" :data-parent="item.parentId" :pageType="item.pageType">
								<span v-if="item.moduleId=='mainUrl'" slot="label" class="homeTab"><i class="el-icon-home"></i></span>
								<tab-cont :moduleId="item.moduleId" :pageUrl="item.pageUrl" :position="item.position" :isShow="item.isShow" :splitCont="item.splitCont">
								</tab-cont>
							</el-tab-pane>
						</el-tabs>
					</template>
				</div>
			</div>
		</div>
	</div>

</template>
<script>
	import { REQUEST_URL, URL_MainMenu } from '@/page/app/ibasePlugin/common/config.js'
	import tabCont from '@/components/tabCont';
	import gridSelector from '@/components/gridSelector';
	import { typeJduge } from '@/page/app/ibasePlugin/util/typeJduge'
	export default {
		data() {
			return {
				headExpand: true, // 头部：显示 或者 隐藏
				homePageItem: {},
				menu: { // 菜单控制属性
					activeFirstMenu: '',
					firstActiveI: -1,
					activeSecondMenu: '',
					secdActiveI: -1,
					activeThirdMenu: '',
					thirdActiveI: -1,
				},
				tabsList: [],
				// activeMenu:'',
				items1: null,
				activeModuleId: '1',
				tabIndex: 0,
				userName: '',
				isCollapse: false,
				// isActive: -1,
				//系统字段
				sysTitle: '',
				sysTitleS: '', //副标题
				logoutUrl: '',
				loginName: '',
				userId: '',
				systemId: '',
				ctx: '',
				formUrl: '',
				workflowUrl: '',
				cl_Tb_Pane_Show: false,
				cl_Tb_Pane_Style: {},
				cl_Tb_Pane_Select_modId: ''
			}
		},
		components: {
			tabCont,
			gridSelector
		},
		computed: {
			wrapType() {
				return this.$store.state.wrapType;
			},
			// 一级菜单
			menuList() {
				let rs = [];
				if(this.items1 != null) {
					rs = this.items1.children
					rs.splice(0, 0, this.homePageItem);
					rs.forEach((item, index) => {
						item.imageUrl = this.$utilHelper.urlEncode(item.imageUrl);
					})
				};
				return rs ? rs : [];
			},
			// 二级菜单
			secondMenu() {
				let rs = [];
				if(!this.menu.activeFirstMenu || !this.menuList) {
					return rs;
				}
				for(var i = 0; i < this.menuList.length; i++) {
					if(this.menu.activeFirstMenu == this.menuList[i].moduleId) {
						rs = this.menuList[i].children;
					}
				}
				return rs ? rs : [];
			},
			// 三级菜单
			thirdMenu() {
				let rs = [];
				if(!this.menu.activeSecondMenu || !this.secondMenu) {
					return rs;
				}
				for(var i = 0; i < this.secondMenu.length; i++) {
					if(this.menu.activeSecondMenu == this.secondMenu[i].moduleId) {
						rs = this.secondMenu[i].children;
					}
				}
				return rs ? rs : [];
			}
		},
		beforeMount() {
			this.initRequest();
			let _this = this;
			//这里可放到全局，提供给子 iframe 调用
			window.addTap = function(event, modul) {
				return _this.addTab(modul)
			}; //打开一个页
			window.closePage = _this.removeTab; //关闭指定标签页
			window.showPage = _this.switchTab; //切换显示指定标签页
			window.setTabName = _this.setTabName; //设置标签页的title
			window.getCurPage = _this.getCurPage; //获得当前显示页的操作对象
			window.findTapWindow = function() {
				return _this.findTapWindow(_this.activeModuleId)
			}; //查找当前模块窗口对象
			window.splitscreen = _this.splitScreen; //分栏操作
			window.splitscreenIsOpen = _this.splitscreenIsOpen;
			window.loadScreenContent = _this.loadScreenContent;
			window.loadScreenUrl = _this.loadScreenUrl;
			window.loadSubTitle = _this.loadSubTitle; // 刷新系统标题
			window.backToCurrentMenuPage = _this.backToCurrentMenuPage; //返回到当前最底层的菜单页面
			window.reloadDatagrid=_this.reloadDatagrid;
			window.openJobList=_this.openJobList;
		},
		methods: {
			/**
			 * 初始化请求数据
			 */
			initRequest() {
				this.$http.fetch(URL_MainMenu).then((res) => {
					if(!res) {
						return;
					}
					this.$store.commit('WRAP_TYPE', 1)
					let _data = res;
					this.userName = _data.realName;
					this.ctx=_data.ctx;
					this.items1 = JSON.parse(_data.mTree);
					//this.items1 = _data.mTree; // 测试
					this.sysTitle = _data.sysTitle;
					this.loginName = _data.organName;
					this.userId = _data.userId;
					this.systemId = _data.sysId;
					this.formUrl = _data.formUrl;
					this.workflowUrl = _data.workflowUrl;
					this.onlyoneCheck();
					this.loginOther();
					document.getElementsByTagName("title")[0].innerText = this.sysTitle;
					this.homePageItem = {
						moduleId: 'mainUrl',
						name: '首页',
						pageUrl: _data.mainUrl
					}
					this.addTab(this.homePageItem);
					this.logoutUrl = _data.logoutUrl;
					// 添加全局参数
					window.realName = this.userName; //如：张三
					window.loginName = this.loginName; //如：zhangsan
					window.userId = this.userId; //如：123456-789-123-546-0394856
					window.systemId = this.systemId; //如：aabbdd-e982-93ab-8327-94354385
					window.ctx = this.ctx; //如：/mainWeb
					window.workflowUrl = this.workflowUrl;
					window.formUrl = this.formUrl;
					REQUEST_URL.config({
						'mainWeb': '/mainWeb',
						'workflowUrl': this.workflowUrl,
						'formUrl': this.formUrl
					});
					window.URL = REQUEST_URL.getUrl();
					this.initMenuTree();
				}).catch(function(err) {
					console.log(err);
				});
			},
			/*
			 *菜单项新增，如果totalNumber的值为null,但是存在totalNumberUrl的话，请求一次那个地址
			 * */
			initMenuTree(){
				var _this=this;
				if(this.items1){
					if(typeJduge.Array(this.items1)){
						run(this.items1);
					}else{
						sort(this.items1);
					}
					function sort(item){
						if(!item.totalNumber){
							if(item.totalNumberUrl){
								_this.$http.fetch(item.totalNumberUrl).then((res) => {
									item.totalNumber=res;
								}).catch(function(err) {
									console.log(err);
								});
							}
						}
						if(item.children&&item.children.length){
							run(item.children);
						}
					}
					function run(arr){
						arr.forEach(function(item,index){
							sort(item);
						});
					}
				}
			},
			parseTotal(total){
				if(typeof total=='number'){
					return total>99?"99+":total;
				}else{
					return parseFloat(total)>99?"99+":total;
				}
			},
			/**
			 * 显示隐藏头部
			 */
			expandHead() {
				this.headExpand = !this.headExpand;
			},
			exitOther() {
				this.$http.fetch(this.formUrl + '/public/logout').then((data) => {})
				this.$http.fetch(this.workflowUrl + '/public/logout').then((data) => {})
				return true;
			},
			//-- 核心服务预登录处理
			loginOther() {
				this.$http.fetch(this.formUrl + '/initLogin').then((data) => {})
				this.$http.fetch(this.workflowUrl + '/initLogin').then((data) => {})
				return true;
			},
			onlyoneCheck() {
				let _this = this;
				this.$http.fetch('/mainWeb/onlyone').then((data) => {
					if(data && data.data) {
						data = data.data;
					}
					if(data.ret == -1) {
						if(data.msg == "0") //不检查重复登录
							return;
					} else if(data.ret == 1) { //仅提示
						_this.$alert("IP地址：" + data.msg + "浏览器", '您的帐号在其它地方登录', {
							confirmButtonText: '确定',
						});
						return;
					} else if(data.ret == 2) { //需要注销
						_this.$alert(`IP地址：${data.msg}浏览器。请重新登录!`, '您的帐号在其它地方登录', {
							confirmButtonText: '确定',
							callback: action => {
								_this.handleCommand('exit');
							}
						});
						return;
					}
					var iTime = Math.random() * 10000;
					if(iTime < 5000) iTime += 5000;
					setTimeout(_this.onlyoneCheck, iTime)
				}).catch((error) => {
					var iTime = Math.random() * 30000;
					if(iTime < 15000) iTime += 15000;
					setTimeout(_this.onlyoneCheck, iTime)
				});
			},
			// 刷新标题
			loadSubTitle() {
				let _this = this;
				this.$http.fetch('/mainWeb/system/listSysInformation').then((data) => {
					if(data && data.length) {
						for(var i = 0, len = data.length; i < len; i++) {
							var sVal = data[i].value;
							if(sVal) {
								if(data[i].key == "系统主标题") {
									_this.sysTitle = sVal;
								} else if(data[i].key == "系统副标题") {
									_this.sysTitleS = sVal;
								}
							}
						}
					}
				}).catch(function(error) {
					// 由网络或者服务器抛出的错误
					_this.$message({
						type: 'error',
						message: ` ${ error }`
					});
					_this.sysTitleS = '';
				});
			},
			closeTabsPane(e) {
				if(e.target.className == 'all') {
					this.tabsList = [];
				} else if(e.target.className == 'others') {
					if(this.cl_Tb_Pane_Select_modId) {
						let tabs = this.tabsList;
						tabs.forEach((tab, index) => {
							if(tab.moduleId != this.cl_Tb_Pane_Select_modId) {
								this.removeTab(tab.moduleId);
							}
						});
					}
				} else {
					if(this.cl_Tb_Pane_Select_modId) {
						let tabs = this.tabsList;
						tabs.forEach((tab, index) => {
							if(tab.moduleId == this.cl_Tb_Pane_Select_modId) {
								this.removeTab(tab.moduleId);
							}
						});
					}
				}
			},
			/**
			 * 切换一级目录方法
			 **/
			switchMenu(item, index) {
				this.menu.activeFirstMenu = item.moduleId;
				this.menu.firstActiveI = index;
				this.switchSecdMenu({}, -1);
				if(item.pageUrl && !item.children) {
					this.addTab(item);
				} else { // 默认切换选中二级菜单中第一项
					if(this.secondMenu.length > 0) {
						this.switchSecdMenu(this.secondMenu[0], 0)
					}
				}
			},
			/**
			 * 切换二级目录方法
			 **/
			switchSecdMenu(item, index) {
				this.menu.activeSecondMenu = item.moduleId;
				//this.menu.activeBusinessId = item.cfgKey;
				this.menu.secdActiveI = index;
				this.menu.thirdActiveI = -1;
				if(this.wrapType == "1" && this.thirdMenu.length == 0) {
					this.menu.activeThirdMenu = item.moduleId;
				} else {
					this.menu.activeThirdMenu = "";
				}
				if(item.pageUrl) {
					this.addTab(item);
					if(this.wrapType == "1") {
						this.$store.commit('CURRENT_MENU', item)
					}
				} else {
					if(this.thirdMenu.length > 0) {
						this.switchThirdMenu(this.thirdMenu[0], 0)
					}
				}
			},
			/**
			 * 切换三级目录方法
			 **/
			switchThirdMenu(item, index) {
				this.menu.thirdActiveI = index;
				this.menu.activeThirdMenu = item.moduleId;
				if(item.pageUrl) {
					this.addTab(item);
					if(this.wrapType == "1") {
						this.$store.commit('CURRENT_MENU', item)
					}
				}
			},
			addTab(item) {
				if(!item.moduleId || !item.name || !item.pageUrl) {
					return;
				}
				let url = item.pageUrl;
				let pageType = 'iframe';
				if(url.indexOf('#') == 0) {
					url = url.substring(1);
					pageType = 'inner';
				}
				if(pageType=='iframe'){
					var iTemp=url.indexOf("://");
					if(iTemp<0 || iTemp>8){
						if(url.charAt(0)!='/'){url = this.ctx+"/"+url;}
					}
				}
				if(this.wrapType == 1) {
					this.tabsList = [{
						moduleId: item.moduleId,
						pageUrl: this.$utilHelper.urlEncode(url),
						title: this.$utilHelper.htmlEncode(item.name),
						splitCont: '',
						position: '',
						isShow: false,
						pageType: pageType,
						isDialog: item.isDialog,
            			cfgKey:item.cfgKey
					}];
				} else {
					let tabs = this.tabsList;
					let flag = true;
					tabs.forEach((tab, index) => {
						if(tab.moduleId == item.moduleId) {
							this.activeModuleId = item.moduleId;
							flag = false;
						}
					});
					if(flag) {
						let newTabName = ++this.tabIndex + '';
						this.tabsList.push({
							moduleId: item.moduleId,
							pageUrl: this.$utilHelper.urlEncode(url),
							title: this.$utilHelper.htmlEncode(item.name),
							name: newTabName,
							splitCont: '',
							position: '',
							isShow: false,
							pageType: pageType,
							isDialog: false,
              				cfgKey:item.cfgKey
						});
					}
					this.activeModuleId = item.moduleId;
				}
			},
			removeTab(moduleId) {
				let tabs = this.tabsList;
				let activeModuleId = this.activeModuleId;
				if(activeModuleId === moduleId) {
					tabs.forEach((tab, index) => {
						if(tab.moduleId === moduleId) {
							let nextTab = tabs[index + 1] || tabs[index - 1];
							if(nextTab) {
								activeModuleId = nextTab.moduleId;
							}
						}
					});
				}
				this.activeModuleId = activeModuleId;
				this.tabsList = tabs.filter(tab => tab.moduleId !== moduleId);
			},
			switchTab(moduleId) {
				this.activeModuleId = moduleId;
			},
			setTabName(moduleId, name) {
				if(moduleId) {
					let tabs = this.tabsList;
					tabs.forEach((tab, index) => {
						if(tab.moduleId == moduleId) {
							tab.title = name;
						}
					});
				}
			},
			// 显示/隐藏分栏窗
			splitScreen(pageId, isSplit) {
				let tabs = this.tabsList;
				tabs.forEach((tab, index) => {
					if(pageId&&pageId.indexOf("main")==0){
						pageId=pageId.substring(4);
					}
					if(pageId&&pageId.indexOf("iframe")==0){
						pageId=pageId.substring(6);
					}
					if(pageId&&pageId.indexOf("split")==0){
						pageId=pageId.substring(5);
					}
					if(tab.moduleId == pageId) {
						tab.isShow = isSplit + '_' + new Date().getTime();
					}
				});
			},
			// 根据pageId获取当前页面分栏窗是否显示
			splitscreenIsOpen(pageId) {
				let rs = false;
				let tabs = this.tabsList;
				tabs.forEach((tab, index) => {
					if(pageId&&pageId.indexOf("main")==0){
						pageId=pageId.substring(4);
					}
					if(pageId&&pageId.indexOf("iframe")==0){
						pageId=pageId.substring(6);
					}
					if(pageId&&pageId.indexOf("split")==0){
						pageId=pageId.substring(5);
					}
					if(tab.moduleId == pageId) {
						rs = tab.isShow;
					}
				});
				return rs;
			},
			//向分栏窗添加内容,html:html模板,pageId：分栏页（要被分栏div）里的iframe的name，position：定位,0右，1下，2左，3上，默认right
			loadScreenContent(_html, pageId, _position) {
				_position=_position?_position:0;
				var type = 'right',isFull=false;
				if(_position==1){
					type = 'bottom';
				}else if(_position==2){
					type = 'left';
				}else if(_position==3){
					type = 'top';
				}else if(_position.toString().length==2){
					var ps=_position.toString().split("");
					if(ps[1]=="1"){type = 'bottom';}
					else if(ps[1]=="2"){type = 'left';}
					else if(ps[1]=="3"){type = 'top';}
					isFull=true;
				}
				let tabs = this.tabsList;
				tabs.forEach((tab, index) => {
					if(pageId&&pageId.indexOf("main")==0){
						pageId=pageId.substring(4);
					}
					if(pageId&&pageId.indexOf("iframe")==0){
						pageId=pageId.substring(6);
					}
					if(pageId&&pageId.indexOf("split")==0){
						pageId=pageId.substring(5);
					}
					if(tab.moduleId == pageId) {
						tab.splitCont = _html;
						tab.position = type+(isFull?"-full":"");
					}
				});
			},
			//向分栏窗添加内容,url:加载页面地址, pageId：分栏页（要被分栏div）里的iframe的name，position：定位，默认right
			loadScreenUrl(url, pageId, _position) {
				var _html = `<iframe class="splitIframe" src=${url}></iframe>`;
				this.loadScreenContent(_html, pageId, _position);
			},
			getTabName(moduleId) {
				let rs = null;
				if(moduleId) {
					let tabs = this.tabsList;
					tabs.forEach((tab, index) => {
						if(tab.moduleId == moduleId) {
							rs = tab.title;
						}
					});
				}
				return rs;
			},
			findTapWindow(moduleId) {
				if(moduleId) {
					let wapper = this.$refs[moduleId][0].$el || null;
					if(wapper) {
						return wapper.getElementsByTagName('iframe')[0].contentWindow || null;
					}
				}
			},
			/**
			 * @returns {
			 *      container:标签页的jquery对象，以li为根节点。
			 *      getModId,获得当前模块ID
			 *      getTitle,获得当前模块标题
			 *      setTitle,设置当前模块标题}
			 */
			getCurPage() {
				let _this = this;
				let rs = null;
				if(_this.activeModuleId) {
					rs = {
						container: _this.$refs[_this.activeModuleId][0].$el || null,
						getModId: function() {
							return _this.activeModuleId
						},
						setTitle: function(name) {
							_this.setTabName(_this.activeModuleId, name);
						},
						getTitle: function() {
							return _this.getTabName(_this.activeModuleId)
						}
					}
				}
				return rs;
			},
			handleCommand(c) {
				if(c == 'exit') {
					this.$confirm('离开此网站?', '提示', {
						confirmButtonText: '离开',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						this.exitOther();
						window.location.href = this.logoutUrl;
					});
				}
			},
			exitSys() {
				if(!this.logoutUrl) return;
				this.$router.push({
					path: this.logoutUrl
				});
				this.$http.fetch(this.logoutUrl).then(function(res) {
					console.log("success" + res);
				}).catch(function(err) {
					console.log(err);
				});
			},
			openJobList(jid){
				var moduleId=this.$store.state.currentMenu.moduleId;
				if(moduleId&&jid){
					for(var mname in components){
						var com=components[mname];
						if(com.moduleId&&com.moduleId==moduleId){
							var sourceURL=com.sourceURL;
							if(sourceURL){
								var searchKey=com.ywcodeKey?com.ywcodeKey:"job_base-jid";
								console.log(searchKey);
								var params={
									page : 1,
				                  	rows : 50,
				                  	searchTxt : searchKey+"::"+jid+"::searchtext",
				                  	_t:new Date().getTime()
								}
								if(com.gridParam.hasOwnProperty("type")){
									params["type"]=com.gridParam.type;
								}
								this.$http.fetch(sourceURL, params).then((col) => {
					                var row=col.rows;
					                let title = "";
				                  	if(row[0]["job_base-jid"]){
					                    title = row[0]["job_base-jid"];
				                  	}
			                  		if(row[0]["job_base-jtitle"]){
					                    if(title)
					                      title += "-";
					                    title += row[0]["job_base-jtitle"];
				                  	}
				                  	let taskId = row[0]["taskinstanceentity-id"];
				                  	if(taskId){
				                  		this.addTab({moduleId:com.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFormByTaskId?taskId='+taskId})
				                  	}else{
				                  		taskId = row[0]["job_base-wfrid"];
				                  		this.addTab({moduleId:com.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFinishForm?historyProcessInstanceId='+taskId})
				                  	}
				              	}).catch((error)=>{
					                this.$SgNotice.error({
										title: '查询对应数据失败'
									});
				              	})
							}
			              	break;
						}
					}
				}
			},
			backToCurrentMenuPage() {
				this.addTab(this.$store.state.currentMenu);
			},
			reloadDatagrid(name,delay){
				if(delay&&typeof delay=='number'&&delay>0){
					setTimeout(function(){action();},delay);
				}else{action();}
				function action(){
					window.backToCurrentMenuPage&&window.backToCurrentMenuPage();
				}
			}
		},
		mounted() {
			/*document.oncontextmenu = function(){
			  return false;
			};*/
			let _this = this;
			components.main=this;
			this.$nextTick(function() {
				document.getElementById('right-pane').onmousedown = function(e) {
					if(e.button == 2) {
						if(e.target.className.indexOf('el-tabs__item') >= 0) {
							_this.cl_Tb_Pane_Style = {
								left: e.clientX + "px",
								top: e.clientY + "px"
							};
							_this.cl_Tb_Pane_Show = true;
							_this.cl_Tb_Pane_Select_modId = e.target.id ? e.target.id.replace('tab-', '') : '';
						}
					}
				}
				document.onclick = function(e) {
					_this.cl_Tb_Pane_Show = false;
					_this.cl_Tb_Pane_Select_modId = '';
				}
			})
		}
	}
</script>
<style>
	.header-nav {
		max-width: 700px;
		overflow: hidden;
		position: relative;
		padding: 0 20px;
	}

	.header-nav>.nav-list {
		padding: 10px 0;
		height: 55px;
		color: #fff;
		white-space: nowrap;
		float: left;
		transition: transform .3s;
	}

	.header-nav>span {
		position: absolute;
		background-color: #1e88e5;
		display: inline-block;
		height: 100%;
		line-height: 75px;
		width: 20px;
		text-align: center;
		color: #fff;
		cursor: pointer;
	}

	.header-nav>.nav-list>div {
		display: inline-block;
		margin: 0 5px;
		cursor: pointer;
	}

	.header-nav>.nav-list>.is-active {
		background-color: #4ba0ea;
	}
	.myStar{
		border-radius: 0.4rem;
		background-color: #FF6B5F;
		color: white;
		font-size: 12px;
	}
	.secondStar{
	    position: absolute;
	    padding: 1px 6px;
	    right: 5px;
	    top: 0.9rem;
	}
	.thirdStar{
		position: absolute;
	    right: 3px;
	    top: -6px;
	    padding: 0 5px;
	    line-height: 18px;
	}
	.right-pane .third-nav li{
		position: relative;
	}
	.nav>.unexpand li{
		position: relative;
	}
	.nav>.unexpand li > .secondStar{
		top: 0.2rem;
	}
</style>
