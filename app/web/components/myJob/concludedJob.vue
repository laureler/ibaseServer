<template>
    <search-grid
      @gridSelect="gridSelect"
      :options="options"
      :iData="iData"
      :eventHander="eventHander"
      :buttons="buttons"
    ></search-grid>
</template>

<script>
    import searchGrid from '@/components/frame/searchGrid';
    import jobMixin from '@/components/mixins/jobMixin.js'
    
    export default {
        name: "concluded-job",
        components:{searchGrid},
        mixins: [ jobMixin ],
        data(){
          return{
            gridParam: {},
            moduleName:"concludedJobForm1",
            sourceURL:URL.JOB_getFinishedJobData,
            eventHander:{
              getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
                components.concludedJobPage.table = this;
                let _this=components.concludedJobPage;
                let gridParam = components.concludedJobPage.gridParam;
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
                let cfgKeyJson=_this.cfgKey==null?null:JSON.parse(_this.cfgKey);
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
                  page:currentPage,
                  rows:pageSize,
                  searchTxt : gridParamStr.join("||"),
                  type: "concludedJob_"
                }
                return new Promise((rs, rj)=> {
                  this.$http.fetch(_this.sourceURL, param).then((col) => {
                    res.totalCount = col.total;
                    res.data = col.rows;
                    rs(res);
                  }).catch((error)=>{
                    rj(res);
                  })
                });
              },
              rowDBclick:function(row,event,table){
              	components.concludedJobPage.handleOpen(this, 'openForm');
              }
            },
            iData:{
              "ordinal":"true",
              "prid": 'concludedJobGrid',
              "pageAble": true,
              "stopInit": true,
              "fname": "concludedJobFileTable",
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
                  let _this = components.concludedJobPage;
                  let activeBusiness=_this.cfgKey == undefined ? null : JSON.parse(_this.cfgKey);
                  let listName = activeBusiness ==  null ? "办结工作" : activeBusiness.listName == undefined ? "办结工作" : activeBusiness.listName;
                  //let listName="办结工作";
                  let _DefinedURL = URL.JOB_getColumnConfig + "?listName=" + listName;
                  let _SaveURL = URL.JOB_saveColumnConfig + "?listName="+listName;
                  window.ShowSetColumnWindow?window.ShowSetColumnWindow(_DefinedURL,_SaveURL,1,window,listName):'';
                }
              },
            ],
          }
        },
        beforeMount(){
          let data=this.cfgKey;
          this.init(data);
        },
        watch:{
          gridParam:{
            handler:function(newVal){
              getComponent('concludedJobFileTable').context.refrushData()
            },
            deep:true
          }
        },
        methods:{
          init:function(data){
            let activeBusiness=data == undefined ? null : JSON.parse(data);
            let listName = activeBusiness ==  null ? "办结工作" : activeBusiness.listName == undefined ? "办结工作" : activeBusiness.listName;
            this.$http.fetch(URL.URL_gridSelector+"?listName="+listName).then((res) => {
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
            this.$http.fetch(URL.JOB_getFinishedJobColumn,{'listName':listName}).then((res) => {
              var oldcol=res.columns[0];
              var newcol=[];
              for(var i=0,len=oldcol.length;i<len;i++){
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
              this.$nextTick(function(){
                this.refrushData();
              });
            });
          },
          gridSelect: function (data) {
            this.$set(this.gridParam,'searchGridData', data);
          },
          //刷新列表数据
		  refrushData: function(){
		  	var main=components.concludedJobPage;
		  	if(main.table)main.table.refrushData();
		  },
          // 列表操作功能
          handleOpen: function(funEvent, funtype){
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
              }else{
              	row=[row];
              }
            }
            switch (funtype) {
              case 'openForm': {
                var title = "";
                if(row[0]["job_base-jid"]){
                  title = row[0]["job_base-jid"];
                }
                if(row[0]["job_base-jtitle"]){
                  if(title)
                    title += "-";
                  title += row[0]["job_base-jtitle"];
                }
                let taskId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({moduleId:this.moduleName+taskId, name:(title!=null&&title!='null'?title:'查看表单')+"窗口", pageUrl:'/workflowWebService/renderFinishForm?historyProcessInstanceId='+taskId});
                break;
              }
              case 'exchange':{
                let procInstId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({
                  moduleId:"ConcludedJobProcess"+procInstId,
                  name:row[0]["job_base-jtitle"],
                  pageUrl:'/workflowWebService/showWorkFlowTraceDrawing?processInstanceId='+procInstId
                })
                break;
              }
            }
          },
        },
        mounted(){
          components.concludedJobPage=this;
          Loaded.clearUnuse();
          Loaded.exec({}, "concludedJobGrid");
        }
    }
</script>

<style scoped>
</style>
