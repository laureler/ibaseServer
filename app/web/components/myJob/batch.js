import axios from 'axios'
//批量操作类
//用于工作流批量操作
let batchs = function(options){
	this.optInfo=options;
	this.count=0;
	this.bOver=false;
	this.init();
}

//原型
batchs.prototype={
	init:function(callback){
		var main=components.main;
		if(main){
			this.count=0;
			this.bOver=false;
			this.main=main;
			var title="批量"+(this.optInfo.action||"")+"处理进度提示";
			main.dialog={
				type:"progress",
				title:title,
				visible:true,
				width:"450px",
				canClose:true,
				full: false,
				footer: true,
				footList: [
					{
						name: 0,
						text: "取消"
					}
				],
				body:	`<div style="margin:0 auto;padding: 0px calc(50% - 63px);">
							<el-progress type="circle" :percentage="nowProgress"></el-progress>
						</div>`,
				data:{
					nowProgress:0,
				}
			}
			return callback&&callback.apply(this);
		}else{
			console.warn("请定义main组件");
			return false;
		}
	},
	//验证前提条件的方法
	validate:function(callback){
		if(!this.main){
			this.main=components.main;
		}
		if(this.main){
			if(this.main.dialog.type&&this.main.dialog.type=="progress"){
				return callback&&callback.apply(this);
			}else{
				return this.init(callback);
			}
		}else{
			console.warn("请定义main组件");
			return false;
		}
	},
	setProgress:function(data){
		return this.validate(function(){
			var msg="";
			if(data.cancel != null&&data.cancel == '1'){
				this.hide();
				this.optInfo.onfinish(data,this.optInfo.action);
				return true;
			}
			if(!data.count)return false;
			if(!data.dealCount)return false;
			var iSta=parseInt(data.dealCount);//已处理任务数
			var iSum=parseInt(data.count);//总任务数
			if(iSum<=0)return;
			if(iSta>=iSum){
				this.main.dialog.data.nowProgress=100;
				this.hide();
				this.optInfo.onfinish(data,this.optInfo.action);
				return true;
			}
			this.main.dialog.data.nowProgress=parseInt(iSta/iSum*100);
			return false;
		});
	},
	setTitle:function(title){
		this.validate(function(){
			this.main.dialog.title=title;
		});
	},
	setBtnText:function(txt){
		this.validate(function(){
			this.main.$set(this.main.dialog.footList[0], "text", txt);
		});
	},
	setBtnDisable:function(flag){
		this.validate(function(){
			this.main.$set(this.main.dialog.footList[0], "disable", flag);
		});
	},
	show:function(){
		this.validate(function(){
			this.main.dialog.data.visible=true;
		});
	},
	hide:function(){
		this.validate(function(){
			this.main.dialog.data.visible=false;
		});
	},
	toggle:function(){
		this.validate(function(){
			this.main.dialog.data.visible=!this.main.dialog.data.visible;
		});
	},
	updateProgress:function(isFirstLoad){
		var _this=this;
    axios({
      method: 'get',
      url: this.optInfo.infoUrl+"?test=",
    }).then((rsp)=>{
      let data = rsp.data
      if(data!=null){
        if(data || data==''){
          if(data.cancel=='1'){
            _this.hide();
            _this.optInfo.onfinish(data,_optInfo.action);
            return;
          }
          if(data.cancel=='2'){
            _this.hide();
            //showError("未查询到可以"+_this.optInfo.action+"的数据,请刷新列表重试");
            return;
          }
          _this.bOver=_this.setProgress(data);
        }else{
          if(!isFirstLoad)
            count++;
        }
        //返回值为空时，关闭进度条
        if(_this.count>5){
          _this.count=0;
          _this.hide();
          showError("未查询到可以"+_optInfo.action+"的数据,请刷新列表重试");
          return;
        }
        if(!_this.bOver){
          setTimeout(function(){
            _this.updateProgress(false);
          },1500);
        }
      }else{
        console.log("data等于null");
      }
    }).catch((hrx,msg,ex)=>{
      if(_this.count<5){
        setTimeout(function(){
          _this.updateProgress(false);
        },1500);
      }else{
        _this.dealAbort(true);
      }
      _this.count++;
    });
    return;
	},
	dealAbort:function(flag){//中止提交
		var _this=this;
		this.setBtnText("取消中...");
		flag = flag?true:false;
		this.setBtnDisable(true);
    axios({
      method: 'get',
      url: this.optInfo.abortUrl,
      data:{cancelFlag:flag},
    }).then((rsp)=>{
      let data = rsp.data;
      if(!data && _this.optInfo.action=='提交'){
        _this.dealAbort(flag);
      }else{
        _this.setBtnDisable(true);
        _this.setBtnText("正在中止...");
      }
    }).catch((hrx,msg,ex)=>{
      $.messager.confirm('提示','你确定要停止吗？',function(r){
        if (r){
          _this.hide();
          //TODO：展示错误信息
          showAjaxError(hrx,msg,ex,"错误信息");
        }
      });
      _this.setBtnDisable(false);
    });
    return;
	}
}

export default batchs;
