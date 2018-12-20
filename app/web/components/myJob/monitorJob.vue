<template>
  <div style="width: 100%;height: 100%">
    <div class="tree">
      <el-tree 
      	v-if="treeColumn.length>0"
       	:data="treeColumn"
       	node-key="id"
       	:default-expand-all="defaultExpandAll"
       	:expand-on-click-node="false"
       	:props="defaultProps"
       	@node-click="treeClick">
      </el-tree>
    </div>
    <div style="height: 100%">
      <search-grid
        @gridSelect="gridSelect"
        :options="options"
        :iData="iData"
        :eventHander="eventHander"
        :buttons="buttons"
        style="width: auto;">
      </search-grid>
    </div>
    <el-dialog :close-on-press-escape="dialogCanCancer" :close-on-click-modal="dialogCanCancer" :title="dialog.title" :class="[dialog.footList&&dialog.footList.length?'hasfooter':'']" :visible.sync="dialog.visible" :fullscreen="dialog.full" :width="dialog.width" :show-close="dialog.canClose">
      <component :is="dyDialog"></component>
      <div v-if="dialog.footer" slot="footer" class="dialog-footer">
					<span v-for="(item,index) in dialog.footList">
						<el-button
              size="mini"
              :key="item.name"
              :type="item.type"
              :disable="item.disable"
              @click="handleClick($event,item.name)">
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
  
  export default {
    name: "monitor-job",
    components:{searchGrid, showJobbatchGrid},
    mixins: [ jobMixin ],
    data(){
      return{
        gridParam:{
          'serchKey':''
        },
        moduleName:"monitorJobForm",
        toutname:'',//超时字段名
				iconList:[],
        defaultExpandAll: true,
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        treeColumn: [{
          'label':'监控工作',
          'children':[
            {'label':'环节超时', 'serchKey':'alreadyTimeout'},
            {'label':'环节即将超时', 'serchKey':'theTimeout'},
            {'label':'流程超时', 'serchKey':'flowTimeOut'},
            {'label':'流程即将超时', 'serchKey':'flowWillTimeOut'},
            {'label':'证中办理', 'serchKey':'runJob'},
            {'label':'已办结', 'serchKey':'handledJob'},
          ]
        }],
        progressBar: null,
        dialogCanCancer:false,
        dialogComponent:null,
        dialog:{
          body:"",
          data:{},
          title:"",
          full:false,
          visible:false,
          width:"500px",
          footer:false,
          canClose:true
        },
        sourceURL:URL.URL_MONITORJOB_getMonitorJobData,
        eventHander:{
          getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
            var main=components.monitorJobPage;
						main.table = this;
            let gridParam = main.gridParam;
            let gridDatas = gridParam.searchGridData;
            let gridParamStr = query.queryText? [query.queryKey+"::"+query.queryText+"::searchtext"]:[];
            if(gridDatas && gridDatas.length>0){
              for(let i=0;i<gridDatas.length;i++ ){
                switch (gridDatas[i].type){
                  case 'text':gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::text"); break;
                  case 'number':gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::number"); break;
                  case 'date': gridParamStr.push(gridDatas[i].searchKey + "::" + gridDatas[i].value + "::date"); break;
                }
              }
            }
            let res={totalCount:0,data:[]};
            let param = {
              page:currentPage,
              rows:pageSize,
              searchTxt:gridParamStr.join("||"),
              serchKey: gridParam.serchKey,
            }
            return new Promise((rs, rj)=> {
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
              }).catch((error)=>{
                rj(res);
              })
            });
          },
        },
        iData:{
          "prid": 'monitorJobGrid',
          "pageAble": true,
          "stopInit": true,
          "ordinal":"true",
          "fname": "monitorJobFileTable",
          "width": "100%",
          "height": "100%",
          "formate":"",
          'columns':[]
        },
        buttons:[
          {
            id:"refrush",
            text:"刷新",
            type:'button',
            onTap:function(ev){
              this.refrushData();
            }
          },
          {
            id:"openForm",
            text:"打开",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'openForm')
            }
          },{
            id:"delete",
            text:"删除",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'delete');
            }
          },{
            id:"changeDeal",
            text:"转办",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'changeDeal');
            }
          },{
            id:"supervise",
            text:"督办",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'supervise');
            }
          },{
            id:"removesupervision",
            text:"解除督办",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'removesupervision');
            }
          },{
            id:"remindByTaskId",
            text:"催办",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'remindByTaskId');
            }
          },{
            id:"suspendProcessInstanceById",
            text:"流程挂起",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'suspendProcessInstanceById');
            }
          },{
            id:"activateByProcInstId",
            text:"解除挂起",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'activateByProcInstId');
            }
          },{
            id:"exchange",
            text:"流转情况",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'exchange')
            }
          },{
            id:"setColumn",
            text:"设置列",
            type:'button',
            onTap:function(ev){
              let listName="监控工作";
              let _DefinedURL = URL.JOB_getColumnConfig + "?listName=" + listName;
              let _SaveURL = URL.JOB_saveColumnConfig + "?listName="+listName;
              window.ShowSetColumnWindow?window.ShowSetColumnWindow(_DefinedURL,_SaveURL,1,window,listName):'';
            }
          },
        ],

        // 批量操作提示配置
        batchDialog:{
          tableData:[],
          dialog:{
            visible:false
          },
        }
      }
    },
    watch:{
      gridParam:{
        handler:function(newVal){
          getComponent('monitorJobFileTable').context.refrushData()
        },
        deep:true
      }
    },
    beforeMount(){
      this.treeCount();
      this.$http.fetch(URL.URL_gridSelector+"?listName=监控工作").then((res) => {
        let _options = res;
        _options.forEach((item)=>{
          if(item.children){
            let id = ''
            item.children.forEach((child)=>{
              id += child.field
            })
            item.id = id;
          }
        });
        this.options = res
      });
      this.$http.fetch(URL.URL_MONITORJOB_getMonitorJobColumn+"?listName=监控工作").then((res) => {
        var oldcol=res.columns[0];
        var newcol=[];
        for(var i=0,len=oldcol.length;i<len;i++){
          if(!oldcol[i].checkbox){
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
          name:"space",
          width:"",
          label:"",
          type:"label",
          control:{}
        })
        this.iData.columns = newcol;
      })
    },
    computed: {
      dyDialog:function(){
        var that=this;
        return {
          template: this.dialog.body,
          data:function(){
            return that.dialog.data;
          },
          mounted:function() {
            that.dialogComponent=this;
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
    methods:{
      gridSelect: function (data) {
        this.$set(this.gridParam,'searchGridData', data);
      },
      treeClick: function (data) {
        if(data.serchKey != this.gridParam.serchKey){
        	this.gridParam.serchKey = data.serchKey;
          let table = getComponent('monitorJobFileTable').context;
          let showStr = "refrush,openForm,delete,exchange,setColumn";
          if("handledJob" == this.gridParam.serchKey){
              for(let i in this.buttons){
                if(this.buttons[i].id && showStr.indexOf(this.buttons[i].id)>-1){
                  table.$set(table.btnHidden, this.buttons[i].id, false);
                }else{
                  table.$set(table.btnHidden, this.buttons[i].id, true);
                }
              }
          }else{
            for(let i in this.buttons){
                table.$set(table.btnHidden, this.buttons[i].id, false);
            }
          }
        }
      },

      // 列表操作功能
      handleOpen: function(funEvent, funtype){
        let row = null;
        let main=components.monitorJobPage;
        if(funEvent.selIndex.length>=1){
          row = funEvent.selIndex;
        }else{
          row = funEvent.$refs["multipleTable"].store.states.currentRow;
          if(!row){
            this.$SgNotice.warning({
              title: "请选择数据后再进行操作"
            });
            return;
          }
          row = [row];
        }
        switch (funtype){
          case 'openForm':{
            row = row[0];
            let title = "";
            if(row["job_base-jid"]){
              title = row["job_base-jid"];
            }
            if(row["job_base-jtitle"]){
              if(title)
                title += "-";
              title += row["job_base-jtitle"];
            }
            let taskId = row["taskinstanceentity-id"];
            this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFormByTaskId?taskId='+taskId})
            break;
          }
          //删除
          case 'delete':{
            let errInfo = [];
            let processInstanceIds = [];
            let businessNumbers=[];
            for(let i=0;i<row.length;i++){
              if(row[i]["job_base-wfrid"]&&row[i]["job_base-wfrid"]!==""){
                processInstanceIds.push(row[i]["job_base-wfrid"]);
                businessNumbers.push(row[i]["job_base-jid"]);
              }
            }
            let job = {};
            this.$confirm('确认删除选择的'+processInstanceIds.length+'条工作吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let success = (data)=>{
                if(data){
                  showError(analyseError(data));
                }else if(processInstanceIds.length==1){
                  main.$SgNotice.success({title: '删除成功'});
                  //刷新列表数据
                  main.treeCount();
                  main.refrushData();
                }
              };
              if(processInstanceIds.length==1){
                this.$http.fetch(URL.URL_MONITORJOB_deleteCreateJobs, {processInstanceIds:processInstanceIds[0],businessNumbers:businessNumbers[0]}).then(success(data)).then(showAxiosError)
              }else{
                this.$http.fetch(URL.URL_MONITORJOB_removeBatchOperationCache, {"cacheKey":"batchUnclaim_"}).then((data) => {
                  workFlow.setVue(main);
                	workFlow.showProgressDialog({
										infoUrl: URL.URL_MONITORJOB_getBatchDeleteJobsStatus,
                  	abortUrl: URL.URL_MONITORJOB_cancelDeleteJob,
                    onfinish:function(info,action){
                    	workFlow.showErrorInfo(info,action);
                    },
                    action:"删除",
                    job:{}
									});
              		this.$http.fetch(URL.URL_MONITORJOB_deleteCreateJobs, {processInstanceIds:processInstanceIds.join(','),businessNumbers:businessNumbers.join(',')}).then(success).catch(showAxiosError);
                }).catch(showAxiosError)
              }
            });
            break;
          }
          //转办
          case 'changeDeal':{
						workFlow.setVue(main);
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
          }
          //督办
          case 'supervise':{
            let errInfo=[];
            let proid=[];
            let disPro=[];
            for(let i=0;i<row.length;i++){
	            if(row[i]["processinstanceentity-processinstancestate"] &&
	          		(row[i]["processinstanceentity-processinstancestate"].indexOf('督办')!= -1 || row[i]["processinstanceentity-processinstancestate"].indexOf('挂起')!= -1) ){
	                let msg={jid:row[i]["job_base-jid"],title:"",message:"所选任务已挂起或者已督办"};
	                errInfo.push(msg);
	                if(i==row.length-1){
	                  //刷新列表数据
	                	main.treeCount();
	                  main.refrushData();
	                }
	                continue;
	          	}
	          	proid.push(row[i]["job_base-jid"]+"@"+row[i]["job_base-wfrid"]);
	          }
	          disPro=main.unique(proid);
	          for(let i = 0;i<disPro.length;i++){
	            let proJid=disPro[i].split("@");
	            workFlow.invokeJson(URL.URL_MONITORJOB_supervision,{"processInstanceId":proJid[1]},
            	{
            		async:false,
            		fFn:function(xhr,err,exmsg){
            			var alertMsg = analyseError(xhr.responseText);
									if (!alertMsg){
										var sOther="";
										if(stat) sOther+="["+stat+"]";
										if(exMsg) sOther+=exmsg;
										if(sOther) sOther="："+sOther;
										alertMsg="未知的原因"+sOther;
									}
									var msg={jid:proJid[0],title:"",message:alertMsg};
									errInfo.push(msg);
            		}
            	});
            	if(i==disPro.length-1){
								//刷新列表数据
                main.treeCount();
          			main.refrushData();
							}
	          }
          	if(errInfo.length>0){
        			main.batchDialog.dialog.visible = true;
        			main.batchDialog.tableData = errInfo;
						}else{
							main.$SgNotice.success({title: '督办成功'});
							//刷新列表数据
              main.refrushData();
						}
            break;
          }
          //解除督办
          case 'removesupervision':{
            let errInfo=[];
            let proid=[];
            let disPro=[];
            for(let i=0;i<row.length;i++){
	            if(row[i]["processinstanceentity-processinstancestate"] == null
	                || row[i]["processinstanceentity-processinstancestate"] == ""
	                || row[i]["processinstanceentity-processinstancestate"].indexOf('督办')== -1){
	              let msg={jid:row[i]["job_base-jid"],title:"",message:"未督办不能解除督办"};
	              errInfo.push(msg);
	              if(i==row.length-1){
	                //刷新列表数据
	                main.treeCount();
	                main.refrushData();
	              }
	              continue;
	            }
	            proid.push(row[i]["job_base-jid"]+"@"+row[i]["job_base-wfrid"]);
	          }
	          disPro=main.unique(proid);
	          for(let i=0;i<disPro.length;i++){
	            let proJid=disPro[i].split("@");
	            workFlow.invokeJson(URL.URL_MONITORJOB_supervision,{"processInstanceId":proJid[1]},
            	{
            		async:false,
            		fFn:function(xhr,err,exmsg){
            			var alertMsg = analyseError(xhr.responseText);
									if (!alertMsg){
										var sOther="";
										if(stat) sOther+="["+stat+"]";
										if(exMsg) sOther+=exmsg;
										if(sOther) sOther="："+sOther;
										alertMsg="未知的原因"+sOther;
									}
									var msg={jid:proJid[0],title:"",message:alertMsg};
									errInfo.push(msg);
            		}
            	});
            	if(i==disPro.length-1){
								//刷新列表数据
                main.treeCount();
          			main.refrushData();
							}
	          }
	        	if(errInfo.length>0){
        			main.batchDialog.dialog.visible = true;
        			main.batchDialog.tableData = errInfo;
						}else{
							main.$SgNotice.success({title: '解除督办成功'});
							//刷新列表数据
              main.refrushData();
						}
            break;
          }
          //催办
          case 'remindByTaskId':{
            workFlow.setVue(main);
      			workFlow.urgeByRid(row[0]);
          }
          //流程挂起
          case 'suspendProcessInstanceById':{
            let errInfo=[];
            let _p=[];
            row=main.uniqueObject(row,"job_base-wfrid");
	          for(let i=0;i<row.length;i++){
	            if(row[i]["processinstanceentity-processinstancestate"]!=null&&row[i]["processinstanceentity-processinstancestate"].indexOf('挂起')!= -1 ){
	              let msg={jid:row[i]["job_base-jid"],title:"",message:"已挂起的工作，不能重复挂起"};
	              errInfo.push(msg);
	              if(i==row.length-1){
	                //刷新列表数据
	                main.treeCount();
	                main.refrushData();
	              }
	              continue;
	            }
	            workFlow.invokeJson(URL.URL_MONITORJOB_suspendProcessInstance,{"processInstanceId":row[i]["job_base-wfrid"]},
            	{
            		async:false,
            		fFn:function(xhr,err,exmsg){
            			var alertMsg = analyseError(xhr.responseText);
									if (!alertMsg){
										var sOther="";
										if(stat) sOther+="["+stat+"]";
										if(exMsg) sOther+=exmsg;
										if(sOther) sOther="："+sOther;
										alertMsg="未知的原因"+sOther;
									}
									var msg={jid:proJid[0],title:"",message:alertMsg};
									errInfo.push(msg);
            		}
            	});
            	if(i==disPro.length-1){
								//刷新列表数据
                main.treeCount();
          			main.refrushData();
							}
	          }
          	if(errInfo.length>0){
        			main.batchDialog.dialog.visible = true;
        			main.batchDialog.tableData = errInfo;
						}else{
							main.$SgNotice.success({title: '流程挂起成功'});
							//刷新列表数据
              main.refrushData();
						}
            break;
          }
          //解除挂起
          case 'activateByProcInstId':{
            let errInfo=[];
            row=main.uniqueObject(row,"job_base-wfrid");
          	for(let i=0;i<row.length;i++){
	            let processinstancestate = row[i]["processinstanceentity-processinstancestate"];
	            if( !processinstancestate || processinstancestate.indexOf('挂起')== -1 ){
	              let msg={jid:row[i]["job_base-jid"],title:"",message:"所选工作未挂起！"};
	              errInfo.push(msg);
	              if(i==row.length-1){
	                //刷新列表数据
	                main.treeCount();
	                main.table.refrushData();
	              }
	              continue;
	            }
	            workFlow.invokeJson(URL.URL_MONITORJOB_activateProcessInstance,{"processInstanceId":row[i]["job_base-wfrid"]},
            	{
            		async:false,
            		fFn:function(xhr,err,exmsg){
            			var alertMsg = analyseError(xhr.responseText);
									if (!alertMsg){
										var sOther="";
										if(stat) sOther+="["+stat+"]";
										if(exMsg) sOther+=exmsg;
										if(sOther) sOther="："+sOther;
										alertMsg="未知的原因"+sOther;
									}
									var msg={jid:proJid[0],title:"",message:alertMsg};
									errInfo.push(msg);
            		}
            	});
            	if(i==disPro.length-1){
								//刷新列表数据
                main.treeCount();
          			main.refrushData();
							}
	          }
          	if(errInfo.length>0){
        			main.batchDialog.dialog.visible = true;
        			main.batchDialog.tableData = errInfo;
						}else{
							main.$SgNotice.success({title: '解除流程挂起成功'});
							//刷新列表数据
              main.refrushData();
						}
            break;
          }
          //流转情况
          case 'exchange':{
            let procInstId = row[0]["job_base-wfrid"];
            this.$parent.openDialog({
              moduleId:"MonitorJobProcess_"+procInstId,
              name:"查看流程窗口",
              pageUrl: "/workflowWebService/showWorkFlowTraceDrawing?processInstanceId="+procInstId, isParent:false,dadName:"monitorJob"
            })
          }
        }
      },
      treeCount:function(){
        let treeNode = this.treeColumn[0].children;
        this.$http.fetch(URL.URL_MONITORJOB_getBusinessTreeCount).then((res) => {
          for(let i =0;i<treeNode.length;i++){
            switch (treeNode[i].serchKey){
              case 'alreadyTimeout':{
                treeNode[i].label = treeNode[i].label+"("+res.alreadyTimeout+")";
                break;
              }
              case 'theTimeout':{
                treeNode[i].label = treeNode[i].label+"("+res.theTimeout+")";
                break;
              }
              case 'flowTimeOut':{
                treeNode[i].label = treeNode[i].label+"("+res.flowTimeOut+")";
                break;
              }
              case 'flowWillTimeOut':{
                treeNode[i].label = treeNode[i].label+"("+res.flowWillTimeOut+")";
                break;
              }
              case 'runJob':{
                treeNode[i].label = treeNode[i].label+"("+res.runJob+")";
                break;
              }
              case 'handledJob':{
                treeNode[i].label = treeNode[i].label+"("+res.handledJob+")";
                break;
              }
            }
          }
        });
      },
      unique:function(arr){
        var res = [];
        var json = {};
        for(var i = 0; i < arr.length; i++){
            if(!json[arr[i]]){
              res.push(arr[i]);
              json[arr[i]] = 1;
            }
        }
        return res;
      },
      uniqueObject:function(arr,field){
        var res = [];
        var json = {};
        for(var i = 0; i < arr.length; i++){
          if(!json[arr[i][field]]){
          res.push(arr[i]);
          json[arr[i][field]] = 1;
          }
        }
        return res;
      },
      initIcon: function(){
				this.$http.fetch("/mainWeb/system/listIconConfigure").then((data)=>{
					this.iconList=data;
					Loaded.exec({}, "monitorJobGrid");
				}).catch((e)=>{
					showAxiosError(e, '获取图标信息出错!');
					Loaded.exec({}, "monitorJobGrid");
				})
			},
      handleClick:()=>{
        if(components.monitorJobPage){
          let _this = components.monitorJobPage;
          _this.dialog.data.callback&&_this.dialog.data.callback.apply(_this.dialogComponent,arguments)
        }
      },
	    refrushData(){
	    	var main=components.monitorJobPage;
	  		if(main.table)main.table.refrushData();
	    }
    },
    mounted(){
      components.monitorJobPage=this;
      Loaded.clearUnuse();
      this.initIcon();
    }
  }
</script>

<style scoped>
  .tree{
    width: 7rem;
    float: left;
    margin-right: .2rem;
    height: 100%;
    background-color: #fff;
    overflow: auto;
  }
  .el-tree-node.is-expanded>.el-tree-node__children{
    overflow: auto;
  }
</style>
