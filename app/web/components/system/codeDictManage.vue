<template>
  <div style="display: flex;flex-direction:column;height: inherit">
    <grid-selector v-if="options.length>0" :requirements="options"></grid-selector>
    <div v-if="options.length>0" class="splitDiv">&nbsp;</div>
    <div style="flex: 1;padding: 10px;height: inherit">
      <i-subData :iData="iData" :handlers="eventHander" :buttons="buttons" common="true"></i-subData>
    </div>

    <el-dialog
      title="编号公式设置"
      :visible.sync="addRow.visible"
      width="400px"
    >
      <table>
        <tbody>
          <tr><td><p class="red-star-before">分类代码:</p></td><td><i-multi-selection :iData="addRow.catalogId" v-model="addRow.catalogId.value" common="true"></i-multi-selection></td></tr>
          <tr><td><p class="red-star-before">代码值:</p><td><i-input :iData="addRow.code" v-model="addRow.code.value" common="true"></i-input></td><td></td></tr>
          <tr><td><p class="red-star-before">显示内容:</p><td><i-input :iData="addRow.showValue" v-model="addRow.showValue.value" common="true"></i-input></td></tr>
          <tr><td><p class="red-star-before">排序值:</p><td> <sg-inputNumber :max="10000" :min="0" v-model="addRow.sortValue.value" style="width: 100%;height: 30px"></sg-inputNumber></td></tr>
        </tbody>
      </table>
      <span slot="footer" class="dialog-footer">
        <template v-if="addRow.isNew">
          <el-button icon="el-icon-circle-check" @click="addClose(true)">保存并关闭</el-button>
          <el-button icon="el-icon-circle-check" @click="addClose(false)">保存并新增</el-button>
        </template>
        <template v-else>
          <el-button icon="el-icon-circle-check" @click="addClose(true, true)">保存</el-button>
        </template>
        <el-button icon="el-icon-error" @click="addRow.visible = false">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="导入文件"
      :visible.sync="importFile.visible"
      :before-close="importFileClose"
      width="400px"
    >
      <p style="display: inline-block;vertical-align: top;margin-top: 5px;">上传文件：</p>
      <el-upload style="width: 300px;display: inline-block"
                   class="upload-demo"
                   action="https://jsonplaceholder.typicode.com/posts/">
      <el-button size="small" type="primary">点击上传</el-button></el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-circle-check" @click="importFile.visible = false">确定</el-button>
        <el-button icon="el-icon-error" @click="importFile.visible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
    import gridSelector from '@/components/gridSelector';
    export default {
        name: "code-dict-manage",
        components:{gridSelector},
        data(){
            return{
                options: [],
                loadAll:false,
                eventHander:{
                  save:function(item,event){
                    var _this=this;
                    //执行保存方法

                  },
                  delete:function(item,callback){
                    var _this=this;
                    //执行删除请求方法
                    /*ajaxDelete(function(){
                      //在回调函数中执行清空选中项等操作
                      callback();
                      //没有刷新按钮需要手动刷新数据  如果有刷新按钮  callback会直接执行刷新按钮点击方法
                      //执行回调刷新界面
                      _this.refrushData();//执行的是下面的getData方法
                    });*/
                  },
                  getData:function(currentPage,pageSize,query){//
                    //获取数据并返回的方法
                    console.log(query);
                    var datas=[];
                    for(var i=(currentPage*pageSize);i<((currentPage+1)*pageSize);i++){
                      datas.push({
                        "catalogId":"#",
                        "code":"code"+(i-pageSize),
                        "showValue":"资料类型",
                        "sortValue":i-pageSize,
                        "rid":"YWZLLX"
                      });
                    }
                    return {totalCount:500,data:datas};
                  }
                },
                datas:[
                  {"code":"ZLLX","catalogId":"#","showValue":"资料类型","sortValue":0,"rid":"YWZLLX"},
                  {"code":"MJDW","catalogId":"#","showValue":"面积单位","sortValue":0,"rid":"MJDW"},
                  {"code":"LZ","catalogId":"#","showValue":"林种","sortValue":0,"rid":"LZ"},
                ],
                val:'',
                iData:{
                    "pageAble": true,
                    "fname": "fileTable",
                    "width": "100%",
                    "height": "100%",
                    "formate":"",
                    'columns':[
                        {
                          "label": "分类代码",
                          "name": "catalogId",
                          "type": "textbox"
                        },{
                          "label": "代码值",
                          "name": "code",
                          "type": "textbox"
                        },{
                          "label": "显示内容",
                          "name": "showValue",
                          "type": "textbox"
                        },{
                          "label": "排序值",
                          "name": "sortValue",
                          "type": "textbox"
                        },
                    ]
                },
                buttons:[
                {
                  id:"addRow",
                  text:"新建",
                  type:'button',
                  disable:true,
                  onTap:function(ev){
                    let _this = this.$parent;
                    _this.addRow.visible = true;
                    _this.addRow.isNew = true;
                    _this.addRow.catalogId.value = '';
                    _this.addRow.code.value = '';
                    _this.addRow.showValue.value = '';
                    _this.addRow.sortValue.value = 0;
                    /*this.loading=true;
                    this.$nextTick(function(){
                      var tableData=initSdTable(node);//查询表格数据
                      if(tableData.rows){
                        this.setTableData(tableData.rows);
                      }
                      this.loading=false;
                    });*/
                  }
                },{
                    id:"modify",
                    text:"修改",
                    type:'button',
                    disable:true,
                    onTap:function(ev){
                      let selectRow = this.$refs['multipleTable'].store.states.currentRow;
                      if(!selectRow){
                        this.$SgNotice.warning({
                          title: '提示',
                          desc: '请选择要修改的数据'
                        });
                        return;}
                      let _this = this.$parent;
                      _this.addRow.visible = true;
                      _this.addRow.isNew = false;
                      _this.addRow.catalogId.value = selectRow.catalogId;
                      _this.addRow.code.value = selectRow.code;
                      _this.addRow.showValue.value = selectRow.showValue;
                      _this.addRow.sortValue.value = selectRow.sortValue;
                    }
                  },{
                    id:"delete",
                    text:"删除",
                    type:'button',
                    disable:true,
                    action:"delete"
                  },{
                    id:"importFile",
                    text:"导入",
                    type:'button',
                    disable:true,
                    onTap:function(ev){
                    }
                  },{
                    id:"exportFile",
                    text:"导出",
                    type:'button',
                    disable:true,
                    onTap:function(ev){
                    }
                  }],
                addRow:{
                    visible:false,
                    isNew:true,
                    rid:{
                      value:''
                    },
                    catalogId:{
                        value:'',
                        "height": "30px",
                        "fdic": {
                          "savevalue": 1,
                          'items':[{
                            "id": "09-000",
                            "text": "定餐标准类型"
                          },{
                            "id": "09-001",
                            "text": "案件状态"
                          }]
                        }
                    },
                    code:{
                        value:'',
                        "height": "30px",
                        "security": "notnull",
                    },
                    showValue:{
                        value:'',
                        "height": "30px",
                        "security": "notnull",
                    },
                    sortValue:{
                        value:0
                    }
                },
                importFile:{
                    visible:false,
                }
            }
        },
        methods:{
            addClose: function (isClose, isModify) {
              if(isClose){
                this.addRow.visible = false;
              }
              if(!isModify){
                this.addRow.catalogId.rid;
                return;
              }
              this.addRow.catalogId.value;
              this.addRow.code.value;
              this.addRow.showValue.value;
              this.addRow.sortValue.value;
            },
            importFileClose: function () {
            }
        },
        mounted(){
          this.$http.fetch('/static/gridSelector.json').then((res) => {
            let _options = res.data;
            _options.forEach((item)=>{
              if(item.children){
                let id = ''
                item.children.forEach((child)=>{
                  id += child.field
                })
                item.id = id;
              }
            });
            this.options = res.data
          });
          this.$nextTick( ()=> {
            let table=getComponent("fileTable").context
            table.setTableData(this.datas);
          })
        }
    }
</script>

<style scoped>
  table{margin: 0 auto;}
  td{padding: 5px;}
  .splitDiv{
    height: 10px;
    background-color: #efeff0;
    /*position: absolute;*/
    /*margin-top: -20px;*/
    width: 100%;
    left: 0;
  }
</style>
