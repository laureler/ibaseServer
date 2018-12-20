<template>
    <div class="frameDialog">
      <!--<div v-if="isDialog" class="back" @click="closeDialog()"><span>返回</span></div>-->
      <div :class="isDialog?'content dialog':'content'" :id='mainID' :ref="mainID">
          <div class="shadow" v-show="shadow"></div>
          <template v-if="pageType=='iframe'">
            <iframe :id='iframeID' :ref="iframeID" :style="mainStyle" :name='iframeID' :src="pageUrl" class="mainIframe"></iframe>
          </template>
          <template v-else>
            <router-view :name="pageUrl" :key="moduleId"></router-view>
          </template>
          <div :id='splitID' :ref="splitID" :style="splitStyle" v-show="splitCont && isShowProp" class="splitscreen1">
            <div>
              <span class="top-border" :style="topBorderStyle" @mousedown="resizeDown"></span>
              <span class="left-border" :style="leftBorderStyle" @mousedown="resizeDown"></span>
              <div class="toolsbar">
              	<el-button size="small" icon="sg-icon sg-icon-close-round" @click="close">关闭</el-button>
              	<el-button size="small" :icon="isfullScreen?'sg-icon sg-icon-arrow-shrink':'sg-icon sg-icon-arrow-expand'" @click="fullScreen">{{!isfullScreen?'全屏':'恢复'}}</el-button>
              </div>
              <div class="splitscreencont" v-html="splitCont"></div>
            </div>
          </div>
      </div>
    </div>
</template>
<script>
  export default {
    data(){
      return {
        shadow:false,
        isShowProp: false,
        isfullScreen: false,
        splitOldW:'',
        splitOldH:'',
        splitH:'100%',
        splitW:'100%',
        splitT:'',
        splitB:'',
        splitL:'',
        splitR:'',
        mainW:'100%',
        mainH:'100%',
        mainT:'',
        mainB:'',
        mainL:'',
        mainR:'',
      }
    },
    props:{
      moduleId:'',
      pageUrl:'',
      isShow:'',
      splitCont:'',
      position:'',
      pageType: '',
      isDialog: '',
      cfgKey:''
    },
    watch:{
      isShow: function (newVal) {
        newVal = newVal.substring(0,newVal.indexOf('_'));
        var Pos=this.position.split("-");
        var Position=Pos[0];
        if(Position == 'right' || Position == 'left'){
          this.mainW = this.splitW = '50%';
          this.mainH = this.splitH = '100%';
          if(Position == 'right'){
            this.mainL = '0';
            this.splitR = '0';
          }else if(Position == 'left'){
            this.mainR = '0';
            this.splitL = '0';
          }
        }
        else if(Position == 'top' || Position == 'bottom'){
          this.mainH = this.splitH = '50%';
          this.mainW = this.splitW = '100%';
          if(Position == 'top'){
            this.mainB = '0';
            this.splitT = '0';
          }else if(Position == 'bottom'){
            this.mainT = '0';
            this.splitB = '0';
          }
        }
        this.isShowProp = newVal=='true'?true:false;
        if(!this.isShowProp){
          	this.close();
        }else{
        	var initFull=Pos[1];
        	if(initFull){
        		this.fullScreen();
        	}
        }
      },
      moduleId: function (newVal) {
      	this.close();
      }
    },
    computed:{
      wrapType(){
        return this.$store.state.wrapType;
      },
      mainID(){
        return "main"+this.moduleId;
      },
      iframeID(){
        return "iframe"+this.moduleId;
      },
      splitID(){
        return "split"+this.moduleId;
      },
      topBorderStyle(){
        let rs = {
          display: 'none'
        };
        var Pos=this.position.split("-");
        var Position=Pos[0];
        if(Position == 'top' || Position == 'bottom'){
          rs.display = 'block';
          if(Position == 'top'){
            rs.bottom = '0px';
          }else{
            rs.top = '0px';
          }
        }
        return rs;
      },
      leftBorderStyle(){
        let rs = {
          display: 'none'
        };
        var Pos=this.position.split("-");
        var Position=Pos[0];
        if(Position == 'right' || Position == 'left'){
          rs.display = 'block';
          if(Position == 'right'){
            rs.left = '0px';
          }else{
            rs.right = '0px';
          }
        }
        return rs;
      },

      mainStyle(){
        let rs = {
          width: this.mainW,
          height: this.mainH,
          top: this.mainT,
          left: this.mainL,
          right: this.mainR,
          bottom: this.mainB
        };
        return rs;
      },

      splitStyle(){
        let rs = {
          width : this.splitW,
          height : this.splitH,
          top: this.splitT,
          left: this.splitL,
          right: this.splitR,
          bottom: this.splitB
        };
        return rs;
      }
    },
    methods:{
      close(){
        this.splitOldH = this.splitOldW = '';
        this.mainB = this.mainT = this.mainL = this.mainR = '';
        this.splitB = this.splitT = this.splitL = this.splitR = '';
        this.mainH = this.mainW = this.splitH = this.splitW = '100%';
        this.isfullScreen = false;
        this.isShowProp = false;
      },
      resizeDown(e){
        let warp = this.$refs[this.mainID];
        this.shadow = true;
        let _warpW = this.$refs[this.mainID].offsetWidth;
        let _warpH = this.$refs[this.mainID].offsetHeight;
        let disW = this.$refs[this.splitID].offsetWidth; //拖拽前div的宽
        let disH = this.$refs[this.splitID].offsetHeight; // 拖拽前div的高
        let _this = this;
        if(_this.position=='right' || _this.position=='left'){
          let disX = e.clientX;// 记录坐标
          warp.onmousemove = function(ev){
            var ev = ev || window.event;
            let W = 0 ;
            //拖拽时为了对宽和高 限制一下范围，定义两个变量
            if(_this.position=='right'){
              W =disX- ev.clientX   + disW ;
            }else{
              W = ev.clientX -disX  + disW ;
            }
            if(W<=200 || (_warpW-W)<=200){return;}
            _this.splitW = W +'px';// 拖拽后物体的宽
            _this.mainW = _warpW - W + 'px';
          };
        }else{
          let disY = e.clientY;// 记录坐标
          warp.onmousemove = function (ev) {
            var ev = ev || window.event;
            let H = 0 ;
            //拖拽时为了对宽和高 限制一下范围，定义两个变量
            if(_this.position=='bottom'){
              H = disY - ev.clientY + disH;
            }else{
              H = ev.clientY - disY + disH;
            }
            if(H<=100 || (_warpH-H)<=100){return;}
            _this.splitH = H +'px';// 拖拽后物体的高
            _this.mainH = _warpH - H + 'px';
          }
        }
        warp.onmouseup = function () {
          _this.shadow = false;
          warp.onmousemove = null;
          warp.onmouseup = null;
        }
      },
      fullScreen(){
        if(!this.isfullScreen){ // 半屏 -> 全屏
          this.splitOldW = this.splitW;
          this.splitOldH = this.splitH;
          this.splitW = '100%';
          this.splitH = '100%';
        }else{ // 全屏 -> 半屏
          this.splitW = this.splitOldW;
          this.splitH = this.splitOldH;
        }
        this.isfullScreen = !this.isfullScreen;
      },
      openDialog(modul){
        if(this.wrapType=='1'){
          modul.isDialog = true;
          this.$parent.addTab(modul);
        }else{
          this.$parent.$parent.$parent.addTab(modul)
        }
      },
      closeDialog(){
        if(this.wrapType=='1'){
          // 获取当前选择的菜单信息
          this.$parent.addTab(this.$store.state.currentMenu);
        }
      }
    },
  }
</script>
<style scoped lang="less">
  .shadow{
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 100%;
  }
  .mainIframe{
    position: absolute;
  }
  .splitscreen1{
    position: absolute;
    border: 1px solid #d8d7d7;
    background-color: #fff;
    z-index: 10;
    box-sizing: border-box;
    .top-border, .left-border{
      display: block;
      border: 0px;
      position: absolute;
      z-index: 20;
    }
    .top-border:hover{
      cursor: s-resize;
    }
    .left-border:hover{
      cursor: e-resize;
    }
    .top-border{width: 100%;height: 2px;}
    .left-border{height: 100%;width: 2px;}
    .toolsbar{
      box-sizing: border-box;
      width:100%;
      min-width:200px;
      line-height:38px;
      position:absolute;;
      border-bottom:1px solid #d8d7d7;
      padding:0px 10px;
      background-color: rgb(244, 244, 244);
      a{
        cursor: pointer;
        display: inline-block;
        line-height: 20px;
        text-decoration: none;
        color: #000;
        border: 1px solid #d8d7d7;
        background-color: #fff;
        font-size: 12px;
        height: 20px;
        padding: 0 7px;
      }
    }
    .splitscreencont{
      position:absolute;
      top:39px;
      bottom:0;
      left:0;right:0;
    }
  }

</style>
