<template>
  <el-dialog
    :title="dialog.title"
    :class="[dialog.footList&&dialog.footList.length?'hasfooter':'']"
    :visible.sync="dialog.visible"
  >
    <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column
        prop="jid"
        label="业务受理号"
        width="180">
      </el-table-column>
      <el-table-column
        prop="message"
        label="错误原因">
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
    export default {
        name: "show-jobbatch-grid",
        props: {
            tableData: {
              type: Array,
              default: () => []
            },
            dialog: {
              type: Object,
              default: () => {}
            }
        },
        data() {
          return{
            dialogCanCancer: true,
            dialog1:{
              title: "结果",
              full: false,
              canClose: true
            }
          }
        }
    }
</script>
