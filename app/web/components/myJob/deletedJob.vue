<template>
  <div style="width: 100%;height: 100%">
    <search-grid
      @gridSelect="gridSelect"
      :options="options"
      :iData="iData"
      :eventHander="eventHander"
      :buttons="buttons"
    ></search-grid>
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
        name: "delete-job",
        components:{searchGrid, showJobbatchGrid},
        mixins: [ jobMixin ],
        data(){
          return{
            gridParam: {},
            moduleName:"deletedJob",
            sourceURL:URL.JOB_getFinishedJobData,
            eventHander:{
              getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
                var main=components.deleteJobPage;
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
                let res={totalCount:0,data:[]};
                let param = {
                  page : currentPage,
                  rows : pageSize,
                  searchTxt : gridParamStr.join("||"),
                  type: "deleteJob_"
                }
                return new Promise((rs, rj)=> {
                  this.$http.fetch(main.sourceURL, param).then((col) => {
                    res.totalCount = col.total;
                    res.data = col.rows;
                    rs(res);
                  }).catch((error)=>{
                    rj(res);
                  })
                });
              },
              rowDBclick:function(row,event,table){
              	components.deleteJobPage.handleOpen(this, 'openForm');
              }
            },
            iData:{
              "prid": 'deleteJobGrid',
              "ordinal":"true",
              "pageAble": true,
              "stopInit": true,
              "fname": "deleteJobFileTable",
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
                id:"delete",
                text:"删除",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'delete')
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
                  let listName="删除箱";
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
        beforeMount(){
          this.$http.fetch(URL.URL_gridSelector+"?listName=删除箱").then((res) => {
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
          this.$http.fetch(URL.JOB_getFinishedJobColumn,{listName:"删除箱"}).then((res) => {
            let oldcol=res.columns[0];
            let newcol=[];
            for(let i=0,len=oldcol.length;i<len;i++){
              if(!oldcol[i].checkbox){
              	if(!oldcol[i].hidden){
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
              getComponent('deleteJobFileTable').context.refrushData()
            },
            deep:true
          }
        },
        methods:{
          gridSelect: function (data) {
            this.$set(this.gridParam,'searchGridData', data);
          },
          //刷新列表数据
		  refrushData: function() {
			var main = components.deleteJobPage;
			if(main.table)main.table.refrushData();
	      },
          // 列表操作功能
          handleOpen: function(funEvent, funtype){
            let row = null;
            let main=components.deleteJobPage;
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
            switch (funtype) {
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
		            let taskId = row["job_base-wfrid"];
		            this.$parent.openDialog({moduleId:this.moduleName+taskId, name:(title!='null' && title != null?title:'查看表单')+"窗口", pageUrl:'/workflowWebService/renderFinishForm?historyProcessInstanceId='+taskId})
		            break;
		          }
              case 'delete': {
                let businessNumbers=[];
                let processInstanceIds = [];
                let bNumberMap = [];
                for(let i in row){
                  bNumberMap[row[i]["job_base-wfrid"]]=row[i]["job_base-jid"];
                  if(row[i]["job_base-wfrid"]){
                    processInstanceIds.push(row[i]["job_base-wfrid"]);
                    businessNumbers.push(row[i]["job_base-jid"]);
                  }
                }
                this.$confirm('你确定要删除选中的'+processInstanceIds.length+'条数据吗？删除后不可恢复！', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  let success = (data)=>{
                    main.$SgNotice.success({title: '删除成功'});
                    main.refrushData();
                  };
                  let errorFun = (e)=>{
                    showAxiosError(e,"删除出错");
                  };
                  if(processInstanceIds.length==1){
                    this.$http.fetch(URL.DELETE_JOB_delete, {processInstanceIds:processInstanceIds[0],businessNumbers:businessNumbers[0]}).then(success).catch(errorFun)
                  }else{
                    this.$http.fetch(URL.JOB_removeBatchOperationCache, {"cacheKey":"batchDeleteJobs_"}).then((data) => {
                      workFlow.setVue(main);
		                	workFlow.showProgressDialog({
												infoUrl: URL.DELETE_JOB_batchStatus,
                      	abortUrl: URL.DELETE_JOB_cancelDeleteJobss,
		                    onfinish:function(info,action){
		                    	workFlow.showErrorInfo(info,action);
		                    },
		                    action:"删除",
		                    job:{}
											});
                      this.$http.fetch(URL.DELETE_JOB_delete, {processInstanceIds:processInstanceIds.join(','),businessNumbers:businessNumbers.join(',')}).then(success).catch(errorFun)
                    }).catch(showAxiosError)
                  }
                })
                break;
              }
              case 'exchange':{
                let procInstId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({
                  moduleId:"DeleteJobProcess"+procInstId,
                  name:"查看流程窗口",
                  pageUrl: '/workflowWebService/showWorkFlowTraceDrawing?processInstanceId=?'+procInstId
                })
                break;
              }
            }
          }
        },
        mounted(){
          components.deleteJobPage=this;
          Loaded.clearUnuse();
          Loaded.exec({}, "deleteJobGrid");
        }
    }
</script>

<style scoped>
</style>
