<template>
  <div style="width: 100%;height: 100%">
    <search-grid
      @gridSelect="gridSelect"
      :options="options"
      :iData="iData"
      :eventHander="eventHander"
      :buttons="buttons"
    ></search-grid>
    <el-dialog
      title="退件处理"
      :visible.sync="returnJobDialog.visible"
      width="20rem">
      <span>退件处理描述：</span><textarea v-model="returnJobDialog.reason" style="vertical-align: middle;resize: none;width: 13rem;height: 3rem"></textarea>
      <span slot="footer" class="dialog-footer">
        <el-button @click="returnJobDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="returnJob()">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
    import searchGrid from '@/components/frame/searchGrid';
    import jobMixin from '@/components/mixins/jobMixin.js'
    
    export default {
        name: "return-job",
        components:{searchGrid},
        mixins: [ jobMixin ],
        data(){
          return{
            gridParam: {},
            moduleName:"ReturnJobForm1",
            sourceURL:URL.JOB_getFinishedJobData,
            eventHander:{
              getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
                components.returnJobPage.table = this;
                let gridParam = components.returnJobPage.gridParam;
                let gridDatas = gridParam.searchGridData;
                let gridParamStr = query.queryText? [query.queryKey+"::"+query.queryText+"::searchtext"]:[];
                if(gridDatas && gridDatas.length>0){
                  for(let i in gridDatas){
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
                  type: "returnJob_"
                }
                return new Promise((rs, rj)=> {
                  this.$http.fetch(URL.JOB_getFinishedJobData, param).then((col) => {
                    res.totalCount = col.total;
                    res.data = col.rows;
                    rs(res);
                  }).catch((error)=>{
                    rj(res);
                  })
                });
              },
              rowDBclick:function(row,event,table){
              	components.returnJobPage.handleOpen(this, 'openForm');
              }
            },
            iData:{
              "prid": 'returnJobGrid',
              "pageAble": true,
              "stopInit": true,
              "ordinal":"true",
              "fname": "returnJobFileTable",
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
                id:"dispose",
                text:"退件处理",
                type:'button',
                onTap:function(ev){
                  this.$parent.$parent.handleOpen(this, 'dispose')
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
                  let listName="退件箱";
                  let _DefinedURL = URL.JOB_getColumnConfig + "?listName=" + listName;
                  let _SaveURL = URL.JOB_saveColumnConfig + "?listName="+listName;
                  window.ShowSetColumnWindow?window.ShowSetColumnWindow(_DefinedURL,_SaveURL,1,window,listName):'';
                }
              },
            ],
            returnJobDialog:{
              visible: false,
              reason: '',
              processInstanceId: ''
            }
          }
        },
        beforeMount(){
          this.$http.fetch(URL.URL_gridSelector+"?listName=退件箱").then((res) => {
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
          this.$http.fetch(URL.RETURN_JOB_Column, {'listName':'退件箱'}).then((res) => {
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
          });
        },
        watch:{
          gridParam:{
            handler:function(newVal){
              getComponent('returnJobFileTable').context.refrushData()
            },
            deep:true
          }
        },
        methods:{
          gridSelect: function (data) {
            this.$set(this.gridParam,'searchGridData', data);
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
                  desc: "请选择数据后再进行操作"
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
		            this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFinishForm?historyProcessInstanceId='+taskId})
		            break;
		          }
              case 'dispose': {
                if(row[0]["processinstanceentity-processinstancestate"]=="处理退件"){
                  this.$SgNotice.warning({
                    desc:'所选择工作已标识为"退件处理"，无需再次标识'
                  })
                  return;
                }
                this.returnJobDialog.visible = true;
                this.returnJobDialog.processInstanceId = row[0]["job_base-wfrid"];
                this.returnJobDialog.reason = '';
                break;
              }
              case 'exchange':{
                let procInstId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({
                  moduleId:"returnJobProcess"+procInstId,
                  name:row["job_base-jtitle"],
                  pageUrl: window.workflowUrl+'/showWorkFlowTraceDrawing?processInstanceId=?'+procInstId
                })
                break;
              }
            }
          },
          returnJob: function () {
            if (!this.returnJobDialog.reason) {
              this.$message({
                type: 'warning',
                message: '请输入退件处理描述作!'
              });
              return;
            }
            this.$http.post(URL.RETURN_JOB_disposeRefund, {disposeAudit: this.returnJobDialog.reason,processInstanceId:this.returnJobDialog.processInstanceId}).then(()=>{
              this.$message({
                type: 'success',
                message: '退件成功!'
              });
              this.returnJobDialog.visible = false
              components.returnJobPage.table.refrushData(); // 刷新列表
            }).catch(()=>{
              this.$message({
                type: 'error',
                message: '退件失败!'
              });
            })
          }
        },
        mounted(){
          components.returnJobPage=this;
          Loaded.clearUnuse();
          Loaded.exec({}, "returnJobGrid");
        }
    }
</script>

<style scoped>
</style>
