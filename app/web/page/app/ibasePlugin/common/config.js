let DEBUGGER = false;
let config_URL = {};
export const URL_MainMenu = 'http://118.24.70.239:7300/mock/5be91c1ff5bc707c7b645802/example/mapData2'
 // export const URL_MainMenu = '/mainWeb/mpdata' // 获取菜单，初始化数据
let setUrl = ()=>{
  config_URL.URL_gridSelector = config_URL.mainWeb + "/myjob/getSelectionInfo"; // 获取表格条件搜索类型数据
  config_URL.batchSuccess = config_URL.TEST + "/myjob/batchSuccess"; // 获取表格条件搜索类型数据

  // 工作列表通用
  config_URL.JOB_getColumnConfig = config_URL.mainWeb + '/myjob/getWorkListColInfo';
  config_URL.JOB_saveColumnConfig = config_URL.mainWeb + '/myjob/saveWorkListColInfo';
  config_URL.JOB_getFinishedJobData = config_URL.mainWeb + '/myjob/getFinishedJobData'; // 获取工作列表通用列表数据
  config_URL.JOB_getFinishedJobColumn = config_URL.mainWeb + "/myjob/getFinishedJobColumn"; // 获取工作列表通用表头
  config_URL.JOB_removeBatchOperationCache = config_URL.workflowUrl + '/removeBatchOperationCache'; // 批量清缓

  // 删除工作列表
  config_URL.DELETE_JOB_Column = config_URL.mainWeb + "/myjob/getFinishedJobColumn";
  config_URL.DELETE_JOB_gridData = config_URL.mainWeb + "/myjob/getFinishedJobData";
  config_URL.DELETE_JOB_delete = config_URL.workflowUrl + "/thoroughDeleteProcessInstance"; // 删除单条
  config_URL.DELETE_JOB_batchStatus = config_URL.workflowUrl + "/getBatchDeleteJobsStatus"; // 进度条状态
  config_URL.DELETE_JOB_cancelDeleteJobss = config_URL.workflowUrl + "/cancelDeleteJobs"; // 进度条完结
  //退件箱
  config_URL.RETURN_JOB_Column = config_URL.mainWeb + "/myjob/getFinishedJobColumn";
  config_URL.RETURN_JOB_disposeRefund = config_URL.workflowUrl + "/disposeRefundProcessInstance";
  //已挂起工作列表
  config_URL.SUSPENSION_JOB_Column = config_URL.mainWeb + "/myjob/getSuspensionJobColumn"; // 列表头
  config_URL.SUSPENSION_JOB_gridData = config_URL.mainWeb + "/myjob/getSuspensionJobData"; // 列表数据
  config_URL.SUSPENSION_JOB_suspendProcessInstance = config_URL.workflowUrl + "/suspendProcessInstance"; // 强制挂起
  config_URL.SUSPENSION_JOB_getProcessInstanceStatus = config_URL.workflowUrl  + "/getProcessInstanceStatus"; // 拒绝挂起
  config_URL.SUSPENSION_JOB_activateProcessInstance = config_URL.workflowUrl + "/activateProcessInstance"; // 解除挂起

  // 待办工作
  config_URL.URL_RUNJOB_Tree = config_URL.mainWeb + '/system/workListTree'; //左侧树结构数据
  config_URL.URL_RUNJOB_TreeCount = config_URL.mainWeb + '/myjob/getBusinessTreeCount'; //树结构内部数据的数值记录
  config_URL.URL_RUNJOB_Column = config_URL.mainWeb + '/myjob/getRunJobColumn'; //表格列标题数据
  config_URL.URL_RUNJOB_RunJobData = config_URL.mainWeb + '/myjob/getRunJobData'; //列数据
  config_URL.URL_RUNJOB_batchUnclaim = config_URL.workflowUrl + '/batchUnclaim'; // 撤办记录
  config_URL.URL_RUNJOB_removeBatchOperationCache = config_URL.workflowUrl + '/removeBatchOperationCache'; // 批量清缓
  config_URL.URL_RUNJOB_getBatchUnclaimStatus = config_URL.workflowUrl + '/getBatchUnclaimStatus'; // 批量撤办记录
  config_URL.URL_RUNJOB_cancelUnclaim = config_URL.workflowUrl + '/cancelUnclaim'; // 批量撤办记录
  config_URL.URL_RUNJOB_batchReceive = config_URL.workflowUrl + '/batchReceive'; // 单条接办记录
  config_URL.URL_RUNJOB_getBatchReceiveStatus = config_URL.workflowUrl + '/getBatchReceiveStatus'; // 批量接办记录，获取接办进度方法
  config_URL.URL_RUNJOB_cancelReceive = config_URL.workflowUrl + '/cancelReceive'; // 批量接办记录，取消接办进度方法

  //已办工作
  config_URL.URL_HANDLEJOB_getHandledJobColumn = config_URL.mainWeb + '/myjob/getHandledJobColumn'; //表格列标题数据
  config_URL.URL_HANDLEJOB_getHandledJobData = config_URL.mainWeb + '/myjob/getHandledJobData'; //表格列标题数据
  config_URL.URL_HANDLEJOB_batchWithdraw = config_URL.workflowUrl + '/batchWithdraw'; // 单条收回记录
  config_URL.URL_HANDLEJOB_removeBatchOperationCache = config_URL.workflowUrl + '/removeBatchOperationCache'; // 批量清缓
  config_URL.URL_HANDLEJOB_getBatchWithdrawStatus = config_URL.workflowUrl + '/getBatchWithdrawStatus'; // 批量收回记录，获取收回进度方法
  config_URL.URL_HANDLEJOB_cancelWithdraw = config_URL.workflowUrl + '/cancelWithdraw'; // 批量收回记录，取消收回进度方法
  config_URL.URL_HANDLEJOB_findTask = config_URL.workflowUrl + '/findTask'; // 催办
  config_URL.URL_HANDLEJOB_remind = config_URL.workflowUrl + '/remind'; // 催办

  // 创建工作
  config_URL.URL_CREATEJOB_businessDefTreeByUserId = config_URL.mainWeb + '/system/businessDefTreeByUserId'; //树结构数据
  config_URL.URL_CREATEJOB_getCreateJobColumn = config_URL.mainWeb + '/myjob/getCreateJobColumn'; //表格列标题数据
  config_URL.URL_CREATEJOB_getCreateJobData = config_URL.mainWeb + '/myjob/getCreateJobData'; //表格列标题数据
  config_URL.URL_CREATEJOB_getBatchComplateStatus = config_URL.workflowUrl + '/getBatchComplateStatus'; // 批量提交记录
  config_URL.URL_CREATEJOB_cancelBatchComplate = config_URL.workflowUrl + '/cancelBatchComplate'; // 批量提交记录
  config_URL.URL_CREATEJOB_batchDivideGroup = config_URL.workflowUrl + '/batchDivideGroup'; // 批量提交记录
  config_URL.URL_CREATEJOB_getBatchDeleteJobsStatus = config_URL.workflowUrl + '/getBatchDeleteJobsStatus'; // 批量删除记录，获取接办进度方法
  config_URL.URL_CREATEJOB_deleteCreateJobs = config_URL.workflowUrl + '/deleteCreateJobs'; //删除单条记录
  config_URL.URL_CREATEJOB_cancelDeleteJobs = config_URL.workflowUrl + '/cancelDeleteJobs'; // 批量删除记录

  //监控工作
  config_URL.URL_MONITORJOB_getMonitorJobColumn = config_URL.mainWeb + '/myjob/getMonitorJobColumn'; //表格列标题数据
  config_URL.URL_MONITORJOB_getMonitorJobData = config_URL.mainWeb + '/myjob/getMonitorJobData'; //表格列标题数据
  config_URL.URL_MONITORJOB_deleteCreateJobs = config_URL.workflowUrl + '/deleteCreateJobs'; //删除单条记录
  config_URL.URL_MONITORJOB_removeBatchOperationCache = config_URL.workflowUrl + '/removeBatchOperationCache'; // 批量清缓
  config_URL.URL_MONITORJOB_getBatchDeleteJobsStatus = config_URL.workflowUrl + '/getBatchDeleteJobsStatus'; // 批量删除记录，获取接办进度方法
  config_URL.URL_MONITORJOB_cancelDeleteJobs = config_URL.workflowUrl + '/cancelDeleteJobs'; // 批量删除记录
  config_URL.URL_MONITORJOB_supervision = config_URL.workflowUrl + '/supervision'; // 督办
  config_URL.URL_MONITORJOB_suspendProcessInstance = config_URL.workflowUrl + '/suspendProcessInstance'; // 挂起
  config_URL.URL_MONITORJOB_activateProcessInstance = config_URL.workflowUrl + '/activateProcessInstance'; // 解除挂起
  config_URL.URL_MONITORJOB_getBusinessTreeCount = config_URL.workflowUrl + '/myjob/getBusinessTreeCount'; // 树数据记录
  config_URL.URL_MONITORJOB_remind = config_URL.workflowUrl + '/remind'; // 催办

  //综合查询 supervisionWeb
  config_URL.URL_COMPREHENSIVJOB_getComprechensiveJobColumn= config_URL.comprechensiveUrl+'/myjob/getComprechensiveJobColumn'; //表格列标题数据
  config_URL.URL_COMPREHENSIVJOB_getComprechensiveJobData= config_URL.comprechensiveUrl+'/myjob/getComprechensiveJobData'; //表格列标题数据

};

export const REQUEST_URL = {
    config:(conf)=>{
      if(DEBUGGER){
        config_URL.TEST = "https://www.easy-mock.com/mock/5b921fe4a2468838e0378198/ibase3";
        config_URL.mainWeb = "https://www.easy-mock.com/mock/5b921fe4a2468838e0378198/ibase3";
        config_URL.workflowUrl = "https://www.easy-mock.com/mock/5b921fe4a2468838e0378198/ibase3";
        config_URL.formUrl = "https://www.easy-mock.com/mock/5b921fe4a2468838e0378198/ibase3";
      }else{
        config_URL.TEST = "https://www.easy-mock.com/mock/5b921fe4a2468838e0378198/ibase3";
        config_URL.mainWeb = conf.mainWeb;
        config_URL.formUrl = conf.formUrl;
        config_URL.workflowUrl = conf.workflowUrl;
        config_URL.comprechensiveUrl='/supervisionWebService';
      }
      setUrl();
    },
    getUrl:()=>{
      return config_URL
    }
}
