/**
 * 工作列表公用
 * */
export default {
	data() {
      	return {
            options: [],
            cfgKey:this.$parent.cfgKey==""?null:this.$parent.cfgKey,
            loadAll:false,
            moduleId:this.$parent.moduleId
      	};
    },
    computed:{
    	ywcodeKey(){
    		var key="";
    		var columns=this.iData.columns||[];
    		for(var i=0,len=columns.length;i<len;i++){
    			if(columns[i].children&&columns[i].children.length){
    				var item=columns[i].children[0];
    				if(item.field=="job_base-jid"){
    					key=columns[i].name;
    				}
    			}
    		}
    		return key;
    	}
    }
}