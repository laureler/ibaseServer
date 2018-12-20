<template>
  <div style="width: 100%;height: 100%">
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
    name: "comprehensive-job",
    components:{searchGrid, showJobbatchGrid},
    mixins: [ jobMixin ],
    data(){
      return{
        taskId:"",
        moduleName:"HandledJobForm1",
        linkDefinitionKey:"",
        processDefinitionId:"",
        processInstanceId:"",
        businessNumber:"",
        defaultExpandAll: true,
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        content:"",
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
        sourceURL:URL.URL_COMPREHENSIVJOB_getComprechensiveJobData,
        gridParam: {},
        eventHander:{
          getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
            components.comprehensiveJobPage.table = this;
            let _this=this.$parent.$parent;
            let gridParam = components.comprehensiveJobPage.gridParam;
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
            let res={totalCount:0,data:[]};
            let param = {
              page:currentPage,
              rows:pageSize,
              searchTxt:gridParamStr.join("||"),
            }
            return new Promise((rs, rj)=> {
              this.$http.fetch(_this.sourceURL, param).then((col) => {
                res.totalCount = col.total;
                res.data = col.rows;
                rs(res);
              }).then((error)=>{
                rj(res);
              })
            });
          },
          rowDBclick:function(row,event,table){
            //跳转页面
            components.comprehensiveJobPage.handleOpen(this, 'openForm');
          }
        },
        iData:{
          "prid": 'comprehensiveJobGrid',
          "pageAble": true,
          "stopInit": true,
          "ordinal":"true",
          "fname": "comprehensiveJobFileTable",
          "width": "100%",
          "height": "100%",
          "formate":"",
          'columns':[],
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
            id:"urge",
            text:"催办",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'urge');
            }
          },{
            id:"cycle",
            text:"收回",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'cycle');
            }
          },{
            id:"showWorkflow",
            text:"查看流程",
            type:'button',
            onTap:function(ev){
              this.$parent.$parent.handleOpen(this, 'showWorkflow');
            }
          },{
            id:"setColumn",
            text:"设置列",
            type:'button',
            onTap:function(ev){
              let activeBusiness=this.$parent.$parent.$parent.cfgKey == undefined ? null : JSON.parse(this.$parent.$parent.$parent.cfgKey);
              let listName = activeBusiness ==  null ? "综合查询" : activeBusiness.listName == undefined ? "综合查询" : activeBusiness.listName;
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
          getComponent('comprehensiveJobFileTable').context.refrushData()
        },
        deep:true
      }
    },
    beforeMount(){
      let data=this.cfgKey;
      this.init(data);
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
      init:function (data) {
        let activeBusiness=data == undefined ? null : JSON.parse(data);
        let listName = activeBusiness ==  null ? "综合查询" : activeBusiness.listName == undefined ? "综合查询" : activeBusiness.listName;
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
        this.$http.fetch(URL.URL_COMPREHENSIVJOB_getComprechensiveJobColumn+"?listName="+listName).then((res) => {
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
        })
      },
      gridSelect: function (data) {
        this.$set(this.gridParam,'searchGridData', data);
      },

      // 列表操作功能
      handleOpen: function(funEvent, funtype){
        let main = components.comprehensiveJobPage;
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
        switch (funtype){
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
            this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFormByTaskId?taskId='+taskId})
            break;
          }
          // ************ 催办***************
          case 'urge':{
            workFlow.setVue(main);
            workFlow.urgeByRid(row[0]);
            break;
          }
          // ************ 催办 end***************

          // ************ 收回 begin***************
          case 'cycle':{
            let taskIds=[];let disTaskIds=[];
            let processDefinitionIds=[];
            let linkDefinitionKeys=[];
            let processInstanceIds=[];
            let job={};
            for(let i=0;i<row.length;i++){
              processDefinitionIds.push(row[i]["processinstanceentity-processdefinitionid"]);
              linkDefinitionKeys.push(row[i]["taskinstanceentity-linkdefinitionkey"]);
              processInstanceIds.push(row[i]["job_base-wfrid"]);
              taskIds.push(row[i]["taskinstanceentity-id"]);
            }
            this.$confirm('当前选中'+taskIds.length+'项工作收回，是否继续？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let success = (data)=>{
                if(data){
                  showError(analyseError(data));
                }else if(taskIds.length==1){
                  main.$SgNotice.success({title: '收回成功'});
                  //刷新列表数据
                  main.refrushData();
                  workFlow.submitEvent(taskIds,"AfterBackOffice");
                }
              };
              if(taskIds.length==1){
                this.$http.fetch(URL.URL_HANDLEJOB_batchWithdraw, {"processDefinitionIds":processDefinitionIds[0],"linkDefinitionKeys":linkDefinitionKeys[0],"processInstanceIds":processInstanceIds[0],"taskIds":taskIds[0]}).then(success).catch(showAxiosError)
              }else{
                this.$http.fetch(URL.URL_HANDLEJOB_removeBatchOperationCache, {"cacheKey":"batchWithdraw_"}).then((data) => {
                  workFlow.setVue(components.comprehensiveJobPage);
                  workFlow.showProgressDialog({
                    infoUrl:URL.URL_HANDLEJOB_getBatchWithdrawStatus,
                    abortUrl:URL.URL_HANDLEJOB_cancelWithdraw,
                    onfinish:function(info,action){
                      workFlow.showErrorInfo(info,action);
                    },
                    action:"收回",
                    job:{}
                  });
                  this.$http.fetch(URL.URL_HANDLEJOB_batchWithdraw, {"processDefinitionIds":processDefinitionIds.join(','),"linkDefinitionKeys":linkDefinitionKeys.join(','),"processInstanceIds":processInstanceIds.join(','),"taskIds":taskIds.join(',')}).then(success).catch(showAxiosError)
                }).catch(showAxiosError)
              }
            });
            break;
          }

          // ************ 查看流程 begin***************
          case 'showWorkflow':{
            if(row[0]["taskinstanceentity-getdraw"] == 'false'){
              this.$alert("业务【"+row[0]["job_base-jid"]+"】:该环节【"+row[0]["taskinstanceentity-linkdefinitionname"]+"】已设置不允许跟踪后续处理，您没有权限查看流程", '提示', {
                confirmButtonText: '确定',
                type: 'error'
              });
              return;
            }
            if(row[0]["taskinstanceentity-getdraw"] == null){
              this.$alert("业务【"+row[0]["job_base-jid"]+"】:没有查询到该环节【"+row[0]["taskinstanceentity-linkdefinitionname"]+"】相关的流程", '提示', {
                confirmButtonText: '确定',
                type: 'error'
              });
              return;
            }
            let procInstId = row[0]["job_base-wfrid"];
            this.$parent.openDialog({
              moduleId:"业务查询业务流转情况_"+procInstId,
              name:"查看流程窗口",
              pageUrl: "/workflowWebService/showWorkFlowTraceDrawing?processInstanceId="+procInstId, isParent:false,dadName:"businessMainpage"
            })
            break;
          }
          // ************ 查看流程 end***************
        }
      },

      handleClick:()=>{
        if(components.comprehensiveJobPage){
          let _this = components.comprehensiveJobPage;
          _this.dialog.data.callback&&_this.dialog.data.callback.apply(_this.dialogComponent,arguments)
        }
      },
      refrushData(){
        var main=components.comprehensiveJobPage;
        main.table.refrushData();
      }
    },
    mounted(){
      components.comprehensiveJobPage=this;
      Loaded.clearUnuse();
      Loaded.exec({}, "comprehensiveJobGrid");
    }
  }
</script>

<style scoped>
</style>
