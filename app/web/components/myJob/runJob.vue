<template>
	<div style="width: 100%;height: 100%">
		<div class="tree" v-if="1==0">
			<div v-show="showTree">
				<el-tree v-if="treeColumn.length>0"
					:data="treeColumn"
					node-key="id"
					:default-expand-all="defaultExpandAll"
					:props="defaultProps" @node-click="treeClick">
				</el-tree>
			</div>
			<div v-show="!showTree" style="width: .2rem;height: 100%;background-color: #fff"></div>
			<i :class="'tree-close ' + (showTree?'':'tree-open')" @click="showTree = !showTree"></i>
		</div>
		<div style="height: 100%">
			<search-grid
				@gridSelect="gridSelect"
				:options="options"
				:iData="iData"
				:eventHander="eventHander"
				:buttons="buttons" style="width: auto;">
			</search-grid>
		</div>
		<el-dialog :close-on-press-escape="dialogCanCancer" :close-on-click-modal="dialogCanCancer" :title="dialog.title" :class="[dialog.footList&&dialog.footList.length?'hasfooter':'']" :visible.sync="dialog.visible" :fullscreen="dialog.full" :width="dialog.width" :show-close="dialog.canClose">
			<component :is="dyDialog"></component>
			<div v-if="dialog.footer" slot="footer" class="dialog-footer">
				<span v-for="(item,index) in dialog.footList">
					<span v-if="item.type=='label'">{{item.text}}</span>
				<el-checkbox v-else-if="item.type=='checkbox'" v-model="item.value">{{item.text}}</el-checkbox>
				<el-radio v-else-if="item.type=='radio'" v-model="dialog.data.radio" :label="item.value">{{item.text}}</el-radio>
				<el-button v-else size="mini" :key="item.name" :type="item.type" :disable="item.disable" @click="handleClick($event,item.name)">
					{{item.text}}
				</el-button>
				</span>
			</div>
		</el-dialog>
		<show-jobbatch-grid :tableData="batchDialog.tableData" :dialog="batchDialog.dialog"></show-jobbatch-grid>
	</div>
</template>

<script>
	import searchGrid from '@/components/frame/searchGrid';
	import jobMixin from '@/components/mixins/jobMixin.js'
	import showJobbatchGrid from '@/components/myJob/showJobbatchGrid'
	import { workFlow } from '@/page/app/ibasePlugin/util/workflow'
	import { typeJduge } from '@/page/app/ibasePlugin/util/typeJduge'
	export default {
		name: "run-job",
		components: {
			searchGrid,
			showJobbatchGrid
		},
		mixins: [ jobMixin ],
		data() {
			return {
				showTree: true,
				moduleName:"RunJobForm",
				toutname:'',//超时字段名
				gridParam: {
					'busId': ''
				},
				iconList:[],
				defaultExpandAll: true,
				defaultProps: {
					children: 'children',
					label: 'label'
				},
				treeColumn: [],
				progressBar: null,
				dialogCanCancer: false,
				dialogComponent: null,
				dialog: {
					body: "",
					data: {},
					title: "",
					full: false,
					visible: false,
					width: "500px",
					footer: false,
					canClose: true
				},
				sourceURL:URL.URL_RUNJOB_RunJobData,
				eventHander: {
					getData: function(currentPage, pageSize, query) { //分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
						var main=components.runJobPage;
						main.table = this;
						let gridParam = main.gridParam;
						let gridDatas = gridParam.searchGridData;
						let res = {
							totalCount: 0,
							data: []
						};
						var userId=window.$.O.getUserId();
						let gridParamStr = query.queryText ? [query.queryKey + "::" + query.queryText + "::searchtext"] : [];
						if(gridDatas && gridDatas.length > 0) {
							for(let i = 0; i < gridDatas.length; i++) {
								switch(gridDatas[i].type) {
									case 'text':
										gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::text");
										break;
									case 'number':
										gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::number");
										break;
									case 'date':
										gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::date");
										break;
								}
							}
						}
			            let cfgKeyJson=main.cfgKey==null?null:JSON.parse(main.cfgKey);
			            let activeBusinessId=cfgKeyJson==null?null : cfgKeyJson.activeBusinessId == undefined?null : cfgKeyJson.activeBusinessId;
			            if(activeBusinessId!=null && activeBusinessId!=""){
			              if(activeBusinessId.indexOf(",")>0){
			                let btitle=activeBusinessId.split(",");
			                for(let bl=0;bl<btitle.length;bl++){
			                  gridParamStr.push("job_base-bpcode::"+btitle[bl]+"::text");
			                }
			              }else {
			                gridParamStr.push("job_base-bpcode::"+activeBusinessId+"::text");
			              }
			            }
						let param = {
							page: currentPage,
							rows: pageSize,
							searchTxt: gridParamStr.join("||"),
							busId: gridParam.busId,
						}
						return new Promise((rs, rj) => {
							this.$http.fetch(main.sourceURL, param).then((col) => {
								res.totalCount = col.total;
								var rows = col.rows || [];
								for(var i = 0, len = rows.length; i < len; i++) {
									if(rows[i]["taskinstanceentity-openstatus"] == null || (rows[i]["taskinstanceentity-openstatus"]&&rows[i]["taskinstanceentity-openstatus"].indexOf(userId) == -1)) { //判断业务是否被打开过
										rows[i]["taskinstanceentity-isimg"] = ["/mainWeb/images/new.png"];
									}
									var processState = rows[i]["processinstanceentity-processinstancestate"]||"";
									var linkState = rows[i]["taskinstanceentity-linkdefinitionstate"]||"";
									var steptimeoutState = rows[i][main.toutname]||"";
									rows[i]["taskinstanceentity-linkdefinitionstateicon"] = [];
									if(linkState.indexOf("挂起") > -1 || processState.indexOf("挂起") > -1) { //挂起
										if(main.guaqiIcon)rows[i]["taskinstanceentity-linkdefinitionstateicon"].push(main.guaqiIcon);
									}
									if(steptimeoutState) { //已超时
										if(steptimeoutState.indexOf("超时") > -1 && main.yichaoshiIcon) { //已超时
											rows[i]["taskinstanceentity-linkdefinitionstateicon"].push(main.yichaoshiIcon);
										} else if(steptimeoutState.indexOf("超时") < 0 && steptimeoutState.substring(2, steptimeoutState.indexOf("天")) < 2) { //将超时
											if(main.jiangchaoshiIcon)rows[i]["taskinstanceentity-linkdefinitionstateicon"].push(main.jiangchaoshiIcon);
										}else if(main.normalIcon) {
											rows[i]["taskinstanceentity-linkdefinitionstateicon"].push(main.normalIcon);
										}
									} else if(main.normalIcon) {
										rows[i]["taskinstanceentity-linkdefinitionstateicon"].push(main.normalIcon);
									}
								}
								res.data = rows;
								rs(res);
							}).catch((error) => {
								rj(res);
							})
						});
					},
					rowDBclick: function(row, event, table) {
						components.runJobPage.handleOpen(this, 'openForm');
					}
				},
				iData: {
					"prid": 'runJobGrid',
					"pageAble": true,
					"stopInit": true,
					"fname": "runJobFileTable",
					"width": "100%",
					"height": "100%",
					"formate": "",
					"ordinal": "true",
					'columns': []
				},
				buttons: [
					/*{
						id: "refrush",
						text: "刷新",
						type: 'button',
						onTap: function(ev) {
							this.refrushData();
						}
					},
					{
						id: "openForm",
						text: "打开",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'openForm')
						}
					},
					{
						id: "receiving",
						text: "接办",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'receiving');
						}
					},*/
					{
						id: "submitForm",
						text: "提交",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'submitForm');
						}
					},
					{
						id: "changeDeal",
						text: "转办",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'changeDeal');
						}
					},
					/*{
						id: "unclaim",
						text: "撤办",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'unclaim');
						}
					},*/
					{
						id: "exchange",
						text: "流转情况",
						type: 'button',
						onTap: function(ev) {
							this.$parent.$parent.handleOpen(this, 'exchange')
						}
					},
					{
						id: "setColumn",
						text: "设置列",
						type: 'button',
						onTap: function(ev) {
              				let _this = components.runJobPage;
              				let activeBusiness=_this.cfgKey == undefined ? null : JSON.parse(_this.cfgKey);
              				let listName = activeBusiness ==  null ? "待办工作" : activeBusiness.listName == undefined ? "待办工作" : activeBusiness.listName;
							//let listName = "在办工作";
							let _DefinedURL = URL.JOB_getColumnConfig + "?listName=" + listName;
							let _SaveURL = URL.JOB_saveColumnConfig + "?listName=" + listName;
							window.ShowSetColumnWindow ? window.ShowSetColumnWindow(_DefinedURL, _SaveURL, 1, window, listName) : '';
						}
					},
				],

				// 批量操作提示配置
				batchDialog: {
					tableData: [],
					dialog: {
						visible: false
					},
				}
			}
		},
		watch: {
			gridParam: {
				handler: function(newVal) {
					getComponent('runJobFileTable').context.refrushData()
				},
				deep: true
			}
		},
		created() {
			let treeNodeLeaf = {};
			let treeNodeParent = [];
			this.$http.fetch(URL.URL_RUNJOB_Tree).then((res) => {
				function setLabel(tree) {
					tree.forEach((t) => {
						t.count = 0;
						t.label = t.text + "（" + t.count + "）";
						if(t.children && t.children.length > 0) {
							treeNodeParent.push(t)
							setLabel(t.children)
						} else {
							treeNodeLeaf[t.id] = t
						}
					})
				};
				setLabel(res)
				this.treeColumn = res;

				this.$http.fetch(URL.URL_RUNJOB_TreeCount).then((res) => {
					let countMap = res;
					for(let key in countMap) {
						if(!treeNodeLeaf[key]) {
							continue;
						}
						treeNodeLeaf[key].count = countMap[key];
						treeNodeLeaf[key].label = treeNodeLeaf[key].text + "（" + treeNodeLeaf[key].count + "）";
					}
					for(let i = 0; i < treeNodeParent.length; i++) {
						let count = 0;

						function addCount(tree) {
							for(let i = 0; i < tree.length; i++) {
								count += tree[i].count;
								if(tree[i].children && tree[i].children.length > 0) {
									addCount(tree[i].children, count)
								}
							}
						}
						addCount(treeNodeParent[i].children);
						treeNodeParent[i].count = count;
						treeNodeParent[i].label = treeNodeParent[i].text + "（" + treeNodeParent[i].count + "）";
					}
				});
			}).then(() => {});
	      	let data=this.cfgKey;
	      	this.init(data);
		},
		computed: {
			dyDialog: function() {
				var that = this;
				return {
					template: this.dialog.body,
					data: function() {
						return that.dialog.data;
					},
					mounted: function() {
						that.dialogComponent = this;
					}
				}
			},
			guaqiIcon:function(){
				var url='';
				for(var i=0,len=this.iconList.length;i<len;i++){
					if(this.iconList[i].key=="挂起"){
						url=this.iconList[i].value;
						break;
					}
				}
				return url;
			},
			normalIcon:function(){
				var url='';
				for(var i=0,len=this.iconList.length;i<len;i++){
					if(this.iconList[i].key=="正常"){
						url=this.iconList[i].value;
						break;
					}
				}
				return url;
			},
			yichaoshiIcon:function(){
				var url='';
				for(var i=0,len=this.iconList.length;i<len;i++){
					if(this.iconList[i].key=="已超时"){
						url=this.iconList[i].value;
						break;
					}
				}
				return url;
			},
			jiangchaoshiIcon:function(){
				var url='';
				for(var i=0,len=this.iconList.length;i<len;i++){
					if(this.iconList[i].key=="将超时"){
						url=this.iconList[i].value;
						break;
					}
				}
				return url;
			}
		},
		methods: {
		  	init:function (data) {
		        let activeBusiness=data == undefined ? null : JSON.parse(data);
		        let listName = activeBusiness ==  null ? "在办工作" : activeBusiness.listName == undefined ? "在办工作" : activeBusiness.listName;
		        this.$http.fetch(URL.URL_gridSelector + "?listName="+listName).then((res) => {
		          let _options = res;
		          _options.forEach((item) => {
		            if(item.children) {
		              let id = ''
		              item.children.forEach((child) => {
		                id += child.field
		              })
		              item.id = id;
		            }
		          });
		          this.options = res
		        });
		        this.$http.fetch(URL.URL_RUNJOB_Column + "?listName="+listName).then((res) => {
		          var oldcol = res.columns[0];
		          var newcol = [];
		          for(var i = 0, len = oldcol.length; i < len; i++) {
		            if(!oldcol[i].checkbox) {
		              	if(oldcol[i].children[0].field == "taskinstanceentity-linkdefinitionstateicon" || oldcol[i].children[0].field == "taskinstanceentity-isimg") {
			                newcol.push({
			                  name: oldcol[i].children[0].field,
			                  width: oldcol[i].width,
			                  label: oldcol[i].title,
			                  type: "icon",
			                  icon: "img",
			                  control: {}
			                })
	              		} else {
		                	if(!oldcol[i].hidden) {
			                  newcol.push({
			                    name: oldcol[i].field,
			                    width: oldcol[i].width,
			                    label: oldcol[i].title,
			                    children: oldcol[i].children,
			                    type: oldcol[i].width ? "label" : "",
			                    control: {}
			                  })
		                	}
		              	}
		              	if(oldcol[i].children[0].field == "taskinstanceentity-steptimeout"){
							this.toutname=oldcol[i].field;
						}
		            }
		          }
		          newcol.push({
		            name: "space",
		            width: "",
		            label: "",
		            type: "label",
		            control: {}
		          })
		          this.iData.columns = newcol;
		          this.$nextTick(function(){
		            this.refrushData();
		          });
		        });
	      	},
			gridSelect: function(data) {
				this.$set(this.gridParam, 'searchGridData', data);
			},
			treeClick: function(data) {
				if(data.id != this.gridParam.busId) {
					this.gridParam.busId = data.id;
				}
			},

			// 列表操作功能
			handleOpen: function(funEvent, funtype) {
				let main = components.runJobPage;
				let row = null;
				if(funEvent.selIndex.length >= 1) {
					row = funEvent.selIndex;
				} else {
					row = funEvent.$refs["multipleTable"].store.states.currentRow;
					if(!row) {
						this.$SgNotice.warning({
							title: "请选择数据后再进行操作"
						});
						return;
					}else{
						row=[row];
					}
				}
				switch(funtype) {
					case 'openForm':
						{
							console.log(row);
							let title = "";
							if(row[0]["job_base-jid"]) {
								title = row[0]["job_base-jid"];
							}
							if(row[0]["job_base-jtitle"]) {
								if(title)
									title += "-";
								title += row[0]["job_base-jtitle"];
							}
							let taskId = row[0]["taskinstanceentity-id"];
							this.$parent.openDialog({
								moduleId: this.moduleName + taskId,
								name: title,
								pageUrl: '/workflowWebService/renderFormByTaskId?taskId=' + taskId
							})
							break;
						}
					// ************ 接办 begin  完成（需自己测试）***************
					case 'receiving':
						{
							let taskIds = [];
							let linkDefinitionKeys = [];
							for(let i = 0; i < row.length; i++) {
								if(row[i]["taskinstanceentity-claimtime"] != null) { //判断任务是否被接办
									continue;
								} else {
									if(row[i]["taskinstanceentity-id"]) {
										taskIds.push(row[i]["taskinstanceentity-id"]);
									} else {
										taskIds.push(row[i]["taskinstanceentity-linkinstanceid"]);
									}
									linkDefinitionKeys.push(row[i]["taskinstanceentity-linkdefinitionkey"]);
								}
							}
							if(taskIds.length <= 0) {
								this.$SgNotice.warning({
									title: "所勾选的任务不需要接办"
								});
								return
							}
							this.$confirm('当前选中' + taskIds.length + '项工作接办，是否继续？', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							}).then(() => {
								let success = () => {
									this.$SgNotice.success({
										title: '接办成功!'
									});
									main.refrushData();
								};
								let errorFun = (e) => {
									showAxiosError(e,"接办出错");
								};
								if(info.length == 1) {
									this.$http.fetch(URL.URL_RUNJOB_batchReceive, {
										"taskIds": taskIds[0],
										"linkDefinitionKeys": linkDefinitionKeys[0]
									}).then(success).catch(errorFun)
								} else {
									this.$http.fetch(URL.URL_RUNJOB_removeBatchOperationCache, {
										"cacheKey": "batchReceive_"
									}).then((data) => {
										workFlow.setVue(main);
										workFlow.showProgressDialog({
											infoUrl: URL.URL_RUNJOB_getBatchReceiveStatus,
											abortUrl: URL.URL_RUNJOB_cancelReceive,
											onfinish: function(info, action) {
												workFlow.showErrorInfo(info, action);
											},
											action: "接办",
											job: {}
										});
										this.$http.fetch(URL.URL_RUNJOB_batchReceive, {
											taskIds: taskIds.join(','),
											linkDefinitionKeys: linkDefinitionKeys.join(',')
										}).then(success).catch(errorFun)
									})
								}
							});
							break;
						}
						// ************ 接办 end***************

						// ************ 提交 begin***************
					case 'submitForm':
						{
							if(row) {
								if(typeJduge.Json(row)) {
									row = [row];
								}
								let taskIds = [];
								for(let i = 0; i < row.length; i++) {
									taskIds.push(row[i]["taskinstanceentity-id"]);
								}
								workFlow.setVue(components.runJobPage);
								if(taskIds.length == 1) {
									workFlow.submitDatas(taskIds, row);
								} else {
									this.$confirm('当前选中' + taskIds.length + '项工作提交，是否继续？', '提示', {
										confirmButtonText: '确定',
										cancelButtonText: '取消',
										type: 'warning'
									}).then(() => {
										workFlow.submitDatas(taskIds, row);
									});
								}
							}
							break;
						}

						// ************ 转办 begin***************
					case 'changeDeal':
						{
							workFlow.setVue(components.runJobPage);
							let taskIds = [];
							for(let i = 0; i < row.length; i++) {
								taskIds.push(row[i]["taskinstanceentity-id"]);
							}
							if(taskIds.length == 1) {
								workFlow.showPasstoDialog(taskIds[0], false);
							} else {
								this.$confirm('当前选中' + taskIds.length + '项工作转办，是否继续？', '提示', {
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
								}).then(() => {
									workFlow.passtoDialogMore(taskIds);
								});
							}
							break;
						} // ************ 转办 end***************

						// ************ 撤办 begin 完成（需自己测试）***************
					case 'unclaim':
						{
							function unique(arr) {
								var res = [];
								var json = {};
								for(var i = 0; i < arr.length; i++) {
									if(!json[arr[i]]) {
										res.push(arr[i]);
										json[arr[i]] = 1;
									}
								}
								return res;
							};
							let proid = [];
							let disPro = [];
							for(let i = 0; i < row.length; i++) {
								proid.push(row[i]["taskinstanceentity-id"]);
							}
							disPro = unique(proid);
							this.$confirm('当前选中' + disPro.length + '项工作撤办，是否继续?', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							}).then(() => {
								let success = (data) => {
									this.$SgNotice.success({
										title: '撤办成功!'
									});
									main.refrushData();
								};
								let errorFun = (e) => {
									showAxiosError(e, '撤办出错!');
								};
								if(disPro.length == 1) {
									this.$http.fetch(URL.URL_RUNJOB_batchUnclaim, {
										taskIds: disPro[0]
									}).then(success).catch(errorFun)
								} else {
									this.$http.fetch(URL.URL_RUNJOB_removeBatchOperationCache, {
										"cacheKey": "batchUnclaim_"
									}).then((data) => {
										workFlow.setVue(components.runJobPage);
										workFlow.showProgressDialog({
											infoUrl: URL.URL_RUNJOB_getBatchUnclaimStatus,
											abortUrl: URL.URL_RUNJOB_cancelUnclaim,
											onfinish: function(info, action) {
												workFlow.showErrorInfo(info, action);
											},
											action: "撤办",
											job: {}
										});
										this.$http.fetch(URL.URL_RUNJOB_batchUnclaim, {
											taskIds: disPro.join(',')
										}).then(success).catch(errorFun)
									})
								}
							});
							break;
						}
						// ************ 撤办 end***************

						// ************ 查看流程 begin***************
					case 'exchange':
						{
							let title = row[0]["job_base-jtitle"];
							let taskId = row[0]["job_base-wfrid"];
							this.$parent.openDialog({
								moduleId: "RunJobProcess" + taskId,
								name: (title != 'null' && title != null ? title : '查看流程') + "窗口",
								pageUrl: '/workflowWebService/showWorkFlowTraceDrawing?processInstanceId=' + taskId
							})
							break;
						}
				}
			},

			initIcon: function(){
				this.$http.fetch("/mainWeb/system/listIconConfigure").then((data)=>{
					this.iconList=data;
					Loaded.exec({}, "runJobGrid");
				}).catch((e)=>{
					showAxiosError(e, '获取图标信息出错!');
					Loaded.exec({}, "runJobGrid");
				})
			},

			//刷新列表数据
			refrushData: function() {
				var main = components.runJobPage;
				if(main.table)main.table.refrushData();
			},

			handleClick: () => {
				if(components.runJobPage) {
					let _this = components.runJobPage;
					_this.dialog.data.callback && _this.dialog.data.callback.apply(_this.dialogComponent, arguments)
				}
			}
		},
		mounted() {
			components.runJobPage = this;
			Loaded.clearUnuse();
			this.initIcon();
		}
	}
</script>

<style scoped>
	.tree {
		position: relative;
		float: left;
		height: 100%;
	}

	.tree>div {
		background-color: #fff;
		margin-right: .2rem;
		overflow: auto;
		height: inherit;
		width: 250px;
	}

	.tree-close {
		position: absolute;
		right: -15px;
		top: .5rem;
		height: 30px;
		width: 20px;
		z-index: 100;
		border: 1px solid #f2f2f2;
		border-left: none;
		box-shadow: 2px 3px 3px #e5e5e5;
		border-radius: 0 5px 5px 0;
		background-image: url("../../asset/css/common/images/combo_arrow_left.png");
		background-repeat: no-repeat;
		background-position: right;
		background-color: #fff;
		cursor: pointer;
	}

	.tree-close.tree-open {
		background-image: url("../../asset/css/common/images/combo_arrow_right.png");
	}
</style>
