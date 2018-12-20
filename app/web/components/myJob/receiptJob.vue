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
        name: "receipt-job",
        components:{searchGrid},
        mixins: [ jobMixin ],
        data(){
          return{
            gridParam: {},
            moduleName:"ReceiptJobForm1",
            sourceURL:URL.JOB_getFinishedJobData,
            eventHander:{
              getData:function(currentPage,pageSize,query){//分页等各种需要加载数据的情况   如果有该方法则使用该方法获取数据
                components.receiptJobPage.table = this;
                let gridParam = components.receiptJobPage.gridParam;
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
                  type: "receiptJob_"
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
              	components.receiptJobPage.handleOpen(this, 'openForm');
              }
            },
            iData:{
              "prid": 'deleteJobGrid',
              "pageAble": true,
              "stopInit": true,
              "ordinal":"true",
              "fname": "deleteJobFileTable",
              "width": "100%",
              "height": "100%",
              "formate":"",
              'columns':[
                {name:'title', width:'', label:'标题', children:[], type:'label', control:{}},
                {name:'jid', width:'', label:'业务受理号', children:[], type:'label', control:{}},
                {name:'createDate', width:'', label:'创建时间', children:[], type:'label', control:{}},
                {name:'applyer', width:'', label:'申请人', children:[], type:'label', control:{}},
                {name:'mark', width:'', label:'申请摘要', children:[], type:'label', control:{}},
                {name:'currCircle', width:'', label:'所在环节', children:[], type:'label', control:{}},
                {name:'accepter', width:'', label:'办理人', children:[], type:'label', control:{}},
                {name:'assignee', width:'', label:'操作', children:[], type:'label', control:{}},
                ]
            },
            buttons:[
              {
                id:"new",
                text:"新建收文流程",
                type:'button',
                onTap:function(ev){
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
              }
            ],
          }
        },
        beforeMount(){
          /*this.$http.fetch(URL.URL_gridSelector+ "?listName=办结工作").then((res) => {
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
          });*/
          this.$http.fetch(URL.JOB_getFinishedJobColumn).then((res) => {
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
              getComponent('deleteJobFileTable').context.refrushData()
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
                  title: "请选择数据后再进行操作"
                });
                return;
              }
				row = [row]
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
	            let taskId = row["taskinstanceentity-id"];
	            this.$parent.openDialog({moduleId:this.moduleName+taskId, name:title, pageUrl:'/workflowWebService/renderFormByTaskId?taskId='+taskId})
	            break;
	          }
              case 'delete': {
                this.$confirm('你确定要删除选中的'+1+'条数据吗？删除后不可恢复！', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  let success = (data)=>{
                    this.$message({
                      type: 'success',
                      message: '删除成功!'
                    });
                    getComponent('deleteJobFileTable').context.refrushData()
                  };
                  let error = (e)=>{
                    this.$message({
                      type: 'error',
                      message: '删除出错!'
                    });
                  };
                  var businessNumbers=[];
                  var processInstanceIds = [];
                  var bNumberMap = [];
                  for(var i=0;i<row.length;i++){
                    bNumberMap[row[i]["job_base-wfrid"]]=row[i]["job_base-jid"];
                    if(row[i]["job_base-wfrid"]&&row[i]["job_base-wfrid"]!==""){
                      processInstanceIds.push(row[i]["job_base-wfrid"]);
                      businessNumbers.push(row[i]["job_base-jid"]);
                    }
                  }
                })
              }
              case 'exchange':{
                let procInstId = row[0]["job_base-wfrid"];
                this.$parent.openDialog({
                  moduleId:"receiptJobProcess"+procInstId,
                  name:row[0]["job_base-jtitle"],
                  pageUrl: window.workflowUrl+'/showWorkFlowTraceDrawing?processInstanceId=?'+procInstId
                })
                break;
              }
            }
          },
        },
        mounted(){
          components.receiptJobPage=this;
          Loaded.clearUnuse();
          Loaded.exec({}, "deleteJobGrid");
        }
    }
</script>

<style scoped>
</style>
