<template>
  <div style="width: 100%;height: 100%">
    <div class="tree">
      <el-tree v-if="treeColumn.length>0"
       	:data="treeColumn"
       	node-key="id"
       	:expand-on-click-node="flag0"
       	:default-expand-all="defaultExpandAll"
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
        style="width: auto;"
      ></search-grid>
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
        name: "suspension-job",
        components:{searchGrid, showJobbatchGrid},
        mixins: [ jobMixin ],
        data(){
          return{
          	flag0:false,
          	flag1:true,
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
            treeColumn: [{
              "id":1,
              "text":"已挂起工作",
              "children":[{
                "type":"1",
                "text":"正在办理",
              },
                {
                  "type":"2",
                  "text":"申请挂起",
                },
                {
                  "type":"3",
                  "text":"已挂起",
                }
              ]
            }],
            defaultExpandAll: true,
            defaultProps: {
              children: 'children',
              label: 'text'
            },
            gridParam: {
              type: -1,
            },
            sourceURL:URL.SUSPENSION_JOB_gridData,
            eventHander:{
              getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
                components.suspensionJobPage.table = this;
                let gridParam = components.suspensionJobPage.gridParam;
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
                  page : currentPage,
                  rows : pageSize,
                  searchTxt : gridParamStr.join("||"),
                  type: gridParam.type
                }
                return new Promise((rs, rj)=> {
                  this.$http.fetch(URL.SUSPENSION_JOB_gridData, param).then((col) => {
                    res.totalCount = col.total;
                    res.data = col.rows;
                    rs(res);
                  }).catch((error)=>{
                    rj(res);
                  })
                });
              },
              rowDBclick:function(row,event,table){
              	components.suspensionJobPage.handleOpen(this, 'openForm');
              }
            },
            iData:{
              "prid": 'suspensionJobGrid',
              "pageAble": true,
              "stopInit": true,
              "ordinal":"true",
              "fname": "suspensionJobFileTable",
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
                id:"forceSuspend",
                text:"强制挂起",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'forceSuspend')
                }
              },{
                id:"agreeSuspend",
                text:"同意挂起",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'agreeSuspend')
                }
              },{
                id:"rejectSuspend",
                text:"拒绝挂起",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'rejectSuspend')
                }
              },{
                id:"relieveSuspend",
                text:"解除挂起",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'relieveSuspend')
                }
              },{
                id:"exchange",
                text:"查看流程",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'exchange')
                }
              },{
                id:"setColumn",
                text:"设置列",
                type:'button',
                onTap:function(ev){
                  let listName="已挂起工作";
                  let _DefinedURL = URL.JOB_getColumnConfig + "?listName=" + listName;
                  let _SaveURL = URL.JOB_saveColumnConfig + "?listName="+listName;
                  window.ShowSetColumnWindow?window.ShowSetColumnWindow(_DefinedURL,_SaveURL,1,window,listName):'';
                }
              },
            ],

            // 批量提示配置
            batchDialog:{
              tableData:[],
              dialog:{
                visible:false,
              },
            }
          }
        },
        beforeMount(){
          this.$http.fetch(URL.URL_gridSelector+ "?listName=已挂起工作").then((res) => {
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
          this.$http.fetch(URL.SUSPENSION_JOB_Column, {'listName':'已挂起工作'}).then((res) => {
            var oldcol=res.columns[0];
            var newcol=[];
            for(var i=0,len=oldcol.length;i<len;i++){
              if(!oldcol[i].checkbox){
                newcol.push({
                  name:oldcol[i].field,
                  width:oldcol[i].width,
                  label:oldcol[i].title,
                  children:oldcol[i].children,
                  type:oldcol[i].width?"label":"",
                  control:{}
                })
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
          });
        },
        watch:{
          gridParam:{
            handler:function(newVal){
              getComponent('suspensionJobFileTable').context.refrushData()
            },
            deep:true
          }
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
	        }
	      },
        methods:{
          gridSelect: function (data) {
            this.$set(this.gridParam,'searchGridData', data);
          },
          treeClick: function (data) {
            if(data.type != this.gridParam.type){
              this.gridParam.type = data.type;
              let table = getComponent('suspensionJobFileTable').context;
              if(data.type == '1'){ // 切换挂起功能的操作按钮显示隐藏
                table.$set(table.btnHidden, "forceSuspend", false);
                table.$set(table.btnHidden, "rejectSuspend", true);
                table.$set(table.btnHidden, "relieveSuspend", true);
                table.$set(table.btnHidden, "agreeSuspend", true);
              }else if(data.type == '2'){
                table.$set(table.btnHidden, "forceSuspend", true);
                table.$set(table.btnHidden, "rejectSuspend", false);
                table.$set(table.btnHidden, "relieveSuspend", true);
                table.$set(table.btnHidden, "agreeSuspend", false);
              }else if(data.type == '3'){
                table.$set(table.btnHidden, "forceSuspend", true);
                table.$set(table.btnHidden, "rejectSuspend", true);
                table.$set(table.btnHidden, "relieveSuspend", false);
                table.$set(table.btnHidden, "agreeSuspend", true);
              }
            }
          },
          // 列表操作功能
          handleOpen: function(funEvent, funtype){
            let main = components.suspensionJobPage;
            workFlow.setVue(main);
            let row = null;
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
              row = [row]
            }
            switch (funtype) {
            	case 'openForm':{
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
              	this.$parent.openDialog({moduleId:"SuspensionJobForm1"+taskId, name:title, pageUrl:'/workflowWebService/renderFormByTaskId?taskId='+taskId})
              	break;
	            }
              //*********** 强制挂起  完成（需自己测试）*****************
              case 'agreeSuspend'://与强制挂起一致
              case 'forceSuspend': {
                let errInfo=[];
                for(let i=0;i<row.length;i++){
                	workFlow.invokeJson(URL.SUSPENSION_JOB_suspendProcessInstance,{"taskId":row[i]["taskinstanceentity-id"]},
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
											var msg={jid:row[i]["job_base-jid"],title:"",message:alertMsg};
											errInfo.push(msg);
                		}
                	});
                }
                if(errInfo.length>0){
                	main.batchDialog.dialog.visible = true;
                	main.batchDialog.tableData = errInfo;
								}else{
									main.$SgNotice.success({title: '挂起成功'});
									//刷新列表数据
		              main.refrushData();
								}
                break;
              }

              //*********** 拒绝挂起  完成（需自己测试）*****************
              case 'rejectSuspend':{
                this.$http.fetch(URL.SUSPENSION_JOB_getProcessInstanceStatus, {"taskId":row[0]["taskinstanceentity-id"],mothedName:"applySuspendNotPass"}).then(()=>{
                  workFlow.refuseSuspension(row[0]["taskinstanceentity-id"]);
                }).catch((e)=>{
                  showAxiosError(e,"拒绝挂起错误");
                  //刷新列表数据
		              main.refrushData();
                })
                break;
              }

              //*********** 解除挂起  完成（需自己测试）*****************
              case 'relieveSuspend': {
                let errInfo=[];
                for(let i=0;i<row.length;i++){
                  if(row[i]["taskinstanceentity-linkdefinitionstate"].indexOf('挂起')== -1 ){
                    let msg={jid:row[i]["job_base-jid"],title:"",message:"所选工作未挂起！"};
                    errInfo.push(msg);
                    if(i==row.length-1){
	                    main.refrushData();
	                  }
                    continue;
                  }
                  workFlow.invokeJson(URL.SUSPENSION_JOB_activateProcessInstance,{taskId: row[i]["taskinstanceentity-id"]},
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
												var msg={jid:row[i]["job_base-jid"],title:"",message:alertMsg};
												errInfo.push(msg);
											}
										}
									);
									if(i==row.length-1){
										main.refrushData();
									}
									if(errInfo.length>0){
										main.batchDialog.dialog.visible = true;
                		main.batchDialog.tableData = errInfo;
									}else{
										main.$SgNotice.success({title: '解除挂起成功'});
									}
                }
                break;
              }
              //*********** 查看流程 *****************
              case 'exchange':{
              	//(title!='null' && title != null?title:'查看流程')+"窗口",
                let procInstId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({
                  moduleId:"ConcludedJobProcess"+procInstId,
                  name:"查看流程窗口",
                  pageUrl: '/workflowWebService/showWorkFlowTraceDrawing?processInstanceId='+procInstId
                })
                break;
              }
            }
          },
          handleClick:()=>{
	          if(components.handleJobPage){
	            let _this = components.handleJobPage;
	            _this.dialog.data.callback&&_this.dialog.data.callback.apply(_this.dialogComponent,arguments)
	          }
	        },
          refrushData(){
	        	var main=components.suspensionJobPage;
	      		if(main.table)main.table.refrushData();
	        }
        },
        mounted(){
          components.suspensionJobPage=this;
          Loaded.clearUnuse();
          let table = getComponent('suspensionJobFileTable').context;
          table.$set(table.btnHidden, "forceSuspend", false);
          table.$set(table.btnHidden, "rejectSuspend", true);
          table.$set(table.btnHidden, "relieveSuspend", true);
          table.$set(table.btnHidden, "agreeSuspend", true);
          Loaded.exec({}, "suspensionJobGrid");
        }
    }
</script>

<style scoped>
  .tree{
    width: 200px;
    float: left;
    margin-right: .2rem;
    height: 100%;
    background-color: #fff;
    overflow: auto;
  }
</style>
