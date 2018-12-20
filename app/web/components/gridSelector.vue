<template>
    <div class="gridSelectorWrapper">
      <dl class="all-type" v-show="showOption">
        <!--<dt>所有分类 ></dt>-->
        <dd v-if="selected && selected.length>0" :class="options && options.length>optionsMaxLen?'selected more':'selected'">
          <p class="title"><span>已选条件</span></p>
          <ul>
            <li v-for="(item, index) in selected" @click="unSelectOpt(item)">{{item.showValue}}</li>
          </ul>
        </dd>
        <dd :class="options && options.length>optionsMaxLen?'types more':'types'" v-if="options && options.length>0" v-for="(item, index) in options" v-show="index<optionsLen">
          <p class="title"><span>{{item.title}}{{item.type=='multi'?'（多选）':''}}</span></p>
          <p v-if="item.type!='multi'" class="all-btn" @click="clearSelecteds(item.id)"><span>全部</span></p>
          <p v-else class="all-btn selectedOpt" @click="clearSelecteds(item.id)"><span>不限</span></p>
          <ul class="contents" v-if="item.code && item.code.length>0 ">
            <li :class="conts.selected?'selectedOpt':''" v-for="(conts, cIndex) in item.code" @click="selectOpt(conts)">{{conts.showValue}}</li>
          </ul>
          <div class="contents" v-if="item.type == 'date'">
            <template v-for="conts in item.rangs">
              <template v-if="conts.code != 'rangSelect'">
                <span :class="conts.selected?'today selectedOpt':'today'" @click="selectDate(conts, index)">{{conts.label}}</span>
              </template>
              <template v-else>
                自定义：
                <el-date-picker
                  type="daterange"
                  v-model="conts.value"
                  range-separator="——"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  size="small"
                  value-format="yyyy-MM-dd"
                  :unlink-panels="unlinkPanels"
                >
                </el-date-picker>
                <a class="check-btn" @click="selectDate(conts, index)">确定</a>
              </template>
            </template>
          </div>
          <div class="contents" v-else-if="item.type == 'number'">
            <el-input-number v-model="item.valueDown" :min="0" :max="10" controls-position="right" size="small"></el-input-number><span style="margin: 0 10px">至</span>
            <el-input-number v-model="item.valueUp" :min="0" :max="1000000" controls-position="right" size="small"></el-input-number>
            <a class="check-btn" @click="selectNumber(item)">确定</a>
          </div>
        </dd>
      </dl>
      <div v-if="showOption && options && options.length>optionsMaxLen" class="more-btn" style="right: 4rem;" @click="showMore()" >
        <span :class="optionsLen>=10000?'close':''">{{optionsLen>=10000?'收起':'更多'}}</span>
      </div>
      <div v-if="options && options.length>0" class="more-btn" @click="toggle()" >
        <span :class="showOption?'close':''">{{showOption?'隐藏':'展开'}}</span>
      </div>
    </div>
</template>

<script>
    export default {
        name: "grid-selector",
        props: {
            'requirements': Array
        },
        data(){
            return{
                unlinkPanels: true,
                optionsMaxLen: 3,
                optionsLen: 0,
                showOption:true,
                options:[],
                selected: []
            }
        },
        watch:{
            selected: {
                handler: function (newVal, oldVal) {
                    let rs = [];
                    newVal.forEach((item)=>{
                        switch (item.type) {
                            case 'date':
                                rs.push({
                                  "searchKey": item.prid,
                                  "type": "date",
                                  "value": item.value[0]+"%"+item.value[1]
                                });
                              break;
                            case 'multi':
                            case 'single':
                              rs.push({
                                "searchKey": item.prid,
                                "type": "text",
                                "value": item.showValue
                              });
                              break;
                            case 'number':
                              rs.push({
                                "searchKey": item.id,
                                "type": "number",
                                "value": item.valueDown+"%"+item.valueUp
                              });
                              break;
                        }
                    })
                    console.log(rs)
                    this.$emit('select', rs);
                },
                deep: true
            }
        },
        methods:{
            showMore(){
                if(this.optionsLen == 10000){
                    this.optionsLen = this.optionsMaxLen
                }else{
                    this.optionsLen = 10000;
                }
            },
            toggle(){
            	if(this.showOption){
            		this.showOption=false;
            	}else{
            		this.showOption=true;
            	}
            },
            handleClick(name){
              this[name]&&this[name].apply(this);

            },
            selectNumber(item){
                item.showValue = item.valueDown + '至' + item.valueUp
                this.selectOpt(item)
            },
            selectDate(item){
                switch(item.code){
                  case 'today':
                    let _today  = new Date(new Date().Format('yyyy/MM/dd')+" 00:00:00");
                    let _nextDate = new Date(new Date().Format('yyyy/MM/dd')+" 23:59:59");
                    let showValue = _today.Format('yyyy-MM-dd') + ' 至 ' + _nextDate.Format('yyyy-MM-dd');
                    item.showValue = showValue;
                    item.value = [_today.Format('yyyy-MM-dd HH:mm:ss'), _nextDate.Format('yyyy-MM-dd HH:mm:ss')];
                    break;
				case 'thisWeek':
					//按周日为一周的最后一天计算  
				    var date = new Date();  
				    //今天是这周的第几天  
				    var today = date.getDay();  
				    //上周日距离今天的天数（负数表示）  
				    var stepSunDay = -today + 1;  
				    // 如果今天是周日  
				    if (today == 0) {  
				        stepSunDay = -7;  
				    }  
				    // 周一距离今天的天数（负数表示）  
				    var stepMonday = 7 - today;  
				    var time = date.getTime();  
				    var monday = new Date(new Date(time + stepSunDay * 24 * 3600 * 1000).Format('yyyy/MM/dd')+" 00:00:00");  
				    var sunday = new Date(new Date(time + stepMonday * 24 * 3600 * 1000).Format('yyyy/MM/dd')+" 23:59:59");
				    
                    item.showValue = monday.Format('yyyy-MM-dd') + ' 至 ' + sunday.Format('yyyy-MM-dd');
                    item.value = [monday.Format('yyyy-MM-dd HH:mm:ss'), sunday.Format('yyyy-MM-dd HH:mm:ss')];
                    break;
                    
				case 'thisMonth':
					// 获取当前月的第一天  
				    var start = new Date();  
				    start.setDate(1);  
				    var startDate=new Date(start.Format('yyyy/MM/dd')+" 00:00:00");
				    // 获取当前月的最后一天  
				    var date = new Date();  
				    var currentMonth = date.getMonth();  
				    var nextMonth = ++currentMonth;  
				    var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1); 
				    var end = new Date(nextMonthFirstDay.getTime() - 1); 
				    
                    item.showValue = startDate.Format('yyyy-MM-dd') + ' 至 ' + end.Format('yyyy-MM-dd');
                    item.value = [startDate.Format('yyyy-MM-dd HH:mm:ss'), end.Format('yyyy-MM-dd HH:mm:ss')];
                    break;  
                    
                  case 'rangSelect':
                    if(item.value.length==0){return;}
                    item.showValue = item.value[0] + ' 至 ' + item.value[1];
                    item.value=[item.value[0]+" 00:00:00",item.value[1]+" 23:59:59"];
                    break;
                }

                this.selectOpt(item)
            },
            selectOpt(item){
                let flag = false;
                if(!item.multi){ // 单选
                  let _this = this;
                  this.selected.forEach((m, i)=>{
                    if(item.prid == m.prid){
                      m.selected = false
                      item.selected = true
                      _this.selected[i] = item;
                      flag = true;
                    }
                  });
                }else{  // 多选
                  this.selected.forEach((m)=>{
                    if(item.prid == m.prid && m.code == item.code){
                      flag = true;
                    }
                  });
                }
                if(!flag){
                  item.selected = true;
                  this.selected.push(item);
                }
            },
            unSelectOpt(item){
                let flag = false, index = -1;
                this.selected.forEach((m, i)=>{
                  if(m.code == item.code && m.prid == item.prid){
                    flag = true;
                    index = i;
                  }
                });
                if(flag){
                  item.selected = false;
                  this.selected.splice(index,1);
                }
            },
            clearSelecteds(prid){
              let _this = this;
              let clear = function () {
                let index = -1;
                for(var i in _this.selected){
                  let m = _this.selected[i];
                  if(m.prid == prid){
                    m.selected = false;
                    index = i;
                    break;
                  }
                }
                if(index>-1){
                  _this.selected.splice(i,1);
                  clear();
                }
              };
              clear();
            }
        },
        mounted(){
            this.optionsLen = this.optionsMaxLen
            let _options = JSON.parse(JSON.stringify(this.requirements))
            _options.forEach((item, index)=>{
              switch (item.type){
                case 'date':
                  item.opstionIndex = index;
                  item.rangs= [
                    {'type':item.type,'code':'today', 'label':'今日', 'showValue':'', 'prid':item.id, 'selected':false},
                    {'type':item.type,'code':'thisWeek', 'label':'本周', 'showValue':'', 'prid':item.id, 'selected':false},
                    {'type':item.type,'code':'thisMonth', 'label':'本月', 'showValue':'', 'prid':item.id, 'selected':false},
                    {'type':item.type,'code':'rangSelect', 'label':'自定义范围','value':[], 'showValue':'', 'prid':item.id},
                  ];
                  break;
                case 'multi':
                case 'single':
                  if(item.code){
                    for(let i in item.code){
                      item.code[i]['type'] = item.type;
                      item.code[i]['prid'] = item.id;
                      item.code[i]['multi'] = (item.type=='multi');
                      item.code[i]['selected'] = false;
                    }
                  }
                  break;
                case 'number':
                  item['valueDown'] = 0
                  item['valueUp'] = 0
              }
            })
            this.options = _options
        }
    }
</script>
