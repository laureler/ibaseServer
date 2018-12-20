<template>
  <div style="width: 100%;height: 100%">
    <search-grid
      @gridSelect="gridSelect"
      :options="options"
      :iData="iData"
      :eventHander="eventHander"
      :buttons="buttons"
      style="width: auto;"
    ></search-grid>
    <div id="cj-show-dialog">
      <el-dialog
        title="选择要启动的工作"
        :visible.sync="addWork.visible"
        width="400px"
      >
        <el-input
          placeholder="输入内容查找"
          v-model="filterText">
        </el-input>
        <el-tree
          :data="treeColumn"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          ref="treeData2">
        </el-tree>

        <span slot="footer" class="dialog-footer">
          <el-button icon="el-icon-circle-check" @click="seleteWork()">确定</el-button>
          <el-button icon="el-icon-error" @click="addWork.visible = false">取消</el-button>
        </span>
      </el-dialog>
    </div>
    <el-dialog :close-on-press-escape="dialogCanCancer" :close-on-click-modal="dialogCanCancer" :title="dialog.title" :class="[dialog.footList&&dialog.footList.length?'hasfooter':'']" :visible.sync="dialog.visible" :fullscreen="dialog.full" :width="dialog.width" :show-close="dialog.canClose">
      <component :is="dyDialog"></component>
      <div v-if="dialog.footer" slot="footer" class="dialog-footer">
            <span v-for="(item,index) in dialog.footList">
              <span v-if="item.type=='label'">{{item.text}}</span>
							<el-checkbox v-else-if="item.type=='checkbox'" v-model="item.value">{{item.text}}</el-checkbox>
							<el-radio v-else-if="item.type=='radio'" v-model="dialog.data.radio" :label="item.value">{{item.text}}</el-radio>
							<el-button
								v-else
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
	import { typeJduge } from '@/page/app/ibasePlugin/util/typeJduge'

  export default {
    name: "create-job",
    components:{searchGrid, showJobbatchGrid},
    mixins: [ jobMixin ],
    data(){
      return{
        defaultExpandAll: true,
        moduleName:"CreateJobForm",
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        loadingTree:true,
        treeColumn: [],
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
        filterText: '',
        checkedWork:'',
        gridParam: {},
        sourceURL:URL.URL_CREATEJOB_getCreateJobData,
        eventHander:{
          getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
            components.createJobPage.table = this;
            let _this=components.createJobPage;
            let gridParam = components.createJobPage.gridParam;
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
            };
            let rand=Math.random();
            return new Promise((rs, rj)=> {
              this.$http.fetch(_this.sourceURL+"?r="+rand, param).then((col) => {
                res.totalCount = col.total;
                res.data = col.rows;
                rs(res);
              }).catch((error)=>{
                rj(res);
              })
            });
          },
          rowDBclick:function(row,event,table){
            //跳转页面
            components.createJobPage.handleOpen(this, 'openForm');
          }
        },
        iData:{
          "prid": 'createJobGrid',
          "ordinal":"true",
          "pageAble": true,
          "stopInit": true,
          "fname": "createJobFileTable",
          "width": "100%",
          "height": "100%",
          "formate":"",
          'columns':[]
        },
        addWork:{
          visible:false,
          selectError:false,
        },
        buttons:[
          /*{//完成
            id:"refrush",
            text:"刷新",
            type:'button',
            onTap:function(ev){
              this.refrushData();
            }
          },*/
          {//完成
            id:"add",
            text:"新建工作",
            type:'button',
            onTap:function(ev){
              let _this = components.createJobPage;
              //this.$http.fetch(URL.URL_RUNJOB_Tree).then((res) => {
              let activeBusiness=_this.cfgKey == undefined ? null : JSON.parse(_this.cfgKey);
              let paramValue = activeBusiness ==  null ? null : activeBusiness.activeBusinessId == undefined ? null : activeBusiness.activeBusinessId;
              let inCode=paramValue==null?null:paramValue.replace(/,/g,'::');
              let paramObject={inCode:inCode};
              this.$http.fetch(URL.URL_CREATEJOB_businessDefTreeByUserId,paramObject)
                .then((res) => {
                function setLabel(tree){
                  tree.forEach((t)=>{
                    t.label = t.text;
                    if(t.children && t.children.length>0){
                      setLabel(t.children)
                    }
                  })
                };
                setLabel(res)
                _this.treeColumn=res;
              })
              _this.addWork.visible = true;
            }
          },
          /*{//完成
            id:"openForm",
            text:"打开",
            type:'button',
            onTap:function(ev){
              components.createJobPage.handleOpen(this, 'openForm')
            }
          },*/{
            id:"submitForm",
            text:"提交",
            type:'button',
            onTap:function(ev){
              components.createJobPage.handleOpen(this, 'submitForm');
            }
          },{
            id:"deleteWork",
            text:"删除",
            disabled:true,
            type:'button',
            onTap:function(ev){
              components.createJobPage.handleOpen(this, 'deleteWork');
            }
          },
          {//完成
            id:"checkProcess",
            text:"查看流程",
            type:'button',
            onTap:function(ev){
              components.createJobPage.handleOpen(this, 'exchange')
            }
          },{//完成
            id:"setColumn",
            text:"设置列",
            type:'button',
            onTap:function(ev){
              let _this = components.createJobPage;
              let activeBusiness=_this.cfgKey == undefined ? null : JSON.parse(_this.cfgKey);
              let listName = activeBusiness ==  null ? "创建工作" : activeBusiness.listName == undefined ? "创建工作" : activeBusiness.listName;
              //let listName="创建工作";
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
        },
      }
    },
    watch:{
      /**
       * 监听数据 当查询到只有一个数据的时候，就直接选中打开
       * @param val
       */
      treeColumn(val){
        if(this.findTreeChildByLoop(val)){
          this.handleNodeClick(val[0])
          this.seleteWork()
        }
      },
      filterText(val) {
        this.$refs.treeData2.filter(val);
      },
      gridParam:{
        handler:function(newVal){
          getComponent('createJobFileTable').context.refrushData()
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
      findTreeChildByLoop(val){
        // 如果传入文件已经是多数据 就不在检查
        if(val==undefined || val.length>1){
          console.log('val数据异常')
          return false
        }
        let valFirstElement = val[0];
        if(valFirstElement.children){
          // 如果当前第一个目录子目录就有多个子结构，不再检查
          if(valFirstElement.children.length >1){
            return false
          }
          // 继续检查
          if(valFirstElement.children.length != 0){
            return this.findTreeChildByLoop(valFirstElement.children)
          }
        }
        let childrenLength = valFirstElement.children.length;
        let selfLength = val.length;
        if(selfLength == 1 && childrenLength == 0){
            return true
        }
        else {
          return false
        }
      },
      init:function (data) {
        let activeBusiness=data == undefined ? null : JSON.parse(data);
        let listName = activeBusiness ==  null ? "创建工作" : activeBusiness.listName == undefined ? "创建工作" : activeBusiness.listName;
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
        this.$http.fetch(URL.URL_CREATEJOB_getCreateJobColumn+"?listName="+listName).then((res) => {
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
        debugger
        let main = components.createJobPage;
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
            if(row[0]["taskinstanceentity-id"]){
              let taskId = row[0]["taskinstanceentity-id"];
              this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:window.workflowUrl+'/renderFormByTaskId?taskId='+taskId})
            }else{
              let taskId = row[0]["job_base-jid"];
              this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:window.workflowUrl+'/getTemporaryBusinessStartForm?businessNumber='+taskId})
            }
            break;
          }
          case 'submitForm':{
            if(row){
          		if(typeJduge.Json(row)){
          			row=[row];
          		}
          		let taskIds =[];
	            for(let i=0 ; i<row.length ; i++){
	              taskIds.push(row[i]["taskinstanceentity-id"]);
	            }
            	workFlow.setVue(main);
            	if(taskIds.length==1){
            		workFlow.submitDatas(taskIds,row);
            	}else{
            		this.$confirm('当前选中'+taskIds.length+'项工作提交，是否继续？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  workFlow.submitDatas(taskIds,row);
                });
            	}
          	}
            break;
          }
          case 'deleteWork':{
            let processInstanceIds = [];
            let businessNumbers=[];
            for(let i=0;i<row.length;i++){
              if(row[i]["job_base-wfrid"]&&row[i]["job_base-wfrid"]!=="0"){
                processInstanceIds.push(row[i]["job_base-wfrid"]);
                businessNumbers.push(row[i]["job_base-jid"]);
              }
            }
            this.$confirm('确认删除选择的'+processInstanceIds.length+'条工作吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let success = (data)=>{
                this.$SgNotice.success({
									title: '删除成功!'
								});
                main.refrushData(); // 刷新
              };
              let error = (e)=>{
              	showAxiosError(e,"删除出错");
              };
              if(processInstanceIds.length==1){
                this.$http.fetch(URL.URL_CREATEJOB_deleteCreateJobs, {
                	processInstanceIds:processInstanceIds[0],businessNumbers:businessNumbers[0]
                }).then(function(data){
                	success(data)
                }).catch(function(e){
                	error(e);
                });
              }else{
                this.$http.fetch(URL.JOB_removeBatchOperationCache, {"cacheKey":"batchDeleteJobs_"}).then((data) => {
                  workFlow.setVue(main);
									workFlow.showProgressDialog({
										infoUrl: URL.URL_CREATEJOB_getBatchDeleteJobsStatus,
                  	abortUrl: URL.URL_CREATEJOB_cancelDeleteJobs,
										onfinish: function(info, action) {
											workFlow.showErrorInfo(info, action);
										},
										action: "删除",
										job: {}
									});
                  this.$http.fetch(URL.URL_CREATEJOB_deleteCreateJobs,
                  	{processInstanceIds:processInstanceIds.join(','),businessNumbers:businessNumbers.join(',')})
                  .then(success).catch(error)
                }).then(error)
              }
            }).catch((e) => {});
            break;
          }
          // ************ 查看流程 begin***************
          case 'exchange':{
            if(!row[0]["taskinstanceentity-id"]){
              this.$SgNotice.success({
								title: '数据还未启动,请先提交!'
							});
              return;
            }
            let procInstId = row[0]["job_base-wfrid"];
            this.$parent.openDialog({
              moduleId:"CreateJobProcess_"+procInstId,
              name:row[0]["job_base-jtitle"] ||'查看流程',
              pageUrl: "/workflowWebService/showWorkFlowTraceDrawing?processInstanceId="+procInstId, isParent:false,dadName:"createJob"
            })
            break;
          }
        }
      },
			//刷新列表数据
		  refrushData: function(){
		  	var main=components.createJobPage;
		  	if(main.table)main.table.refrushData();
		  },
      handleNodeClick: function(data){//创建工作->点击选择树
        if((data.children && data.children.length >0) || !data.attributes.wfRID || data.attributes.wfRID=="#"){
          this.addWork.selectError = true;
        }else{
          this.addWork.selectError = false;
          this.checkedWork = data;
        }
      },
      seleteWork: function () {//创建工作->确认选择一项工作
        if(this.addWork.selectError){
          this.$alert('您选择的是分类项，请选择工作项!', '提示', {
            confirmButtonText: '确定',
          });
          this.checkedWork = '';
        }else if(this.checkedWork == ''){
          this.$alert('请先选择要启动的工作!', '提示', {
            confirmButtonText: '确定',
          });
        }else{
          //选中的要启动工作项this.checkedWork
          this.$parent.openDialog({
            moduleId:this.moduleName+(new Date()).getTime(),
            name:"新建工作窗口",
            pageUrl:'/workflowWebService/getBusinessStartForm?businessDefinitionId='+this.checkedWork.attributes.rid,
            isParent:false,dadName:"createJob"
          })
          this.addWork.visible = false;
          this.checkedWork = '';
        }
      },
      filterNode: function(value, data){
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      handleClick:()=>{
        if(components.createJobPage){
          let _this = components.createJobPage;
          _this.dialog.data.callback&&_this.dialog.data.callback.apply(_this.dialogComponent,arguments)
        }
      }
    },
    mounted(){
      components.createJobPage=this;
      Loaded.clearUnuse();
      Loaded.exec({}, "createJobGrid");
    }
  }
</script>

<style>
  #cj-show-dialog .el-dialog__wrapper .el-dialog .el-dialog__body{
    position: relative;
    height: 400px;
    overflow: hidden;
  }
  #cj-show-dialog .el-dialog__wrapper .el-dialog .el-dialog__body .el-input{
    height:33px;
    width: 360px;
    position: absolute;
  }
  #cj-show-dialog .el-dialog__wrapper .el-dialog .el-dialog__body .el-tree{
    position: absolute;
    top: 50px;
    width: 360px;
    height: 350px;
    overflow: auto;
  }
</style>
