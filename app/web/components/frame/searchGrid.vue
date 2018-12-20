<template>
  <div style="width: 100%;height: 100%;display: flex;flex-direction: column;">
    <div v-if="options.length>0" style="margin-bottom: .2rem">
    	<grid-selector :requirements="options" @select="gridSelect"></grid-selector>
    </div>
    <div style="flex: 1;padding: .3rem;background-color: #fff;overflow: hidden">
    	<i-subData :iData="iData" :handlers="eventHander" :buttons="buttons" :loadAll="loadAll" common="true" style="font-size: 14px"></i-subData>
    </div>
  </div>
</template>

<script>
    import gridSelector from '@/components/gridSelector';
    export default {
        name: "search-grid",
        components:{gridSelector},
        props:{
          options:{
            type: Array,
            default: () => []
          },
          iData:{
            type: Object,
            default: () => {}
          },
          eventHander:{
            type: Object,
            default: () => {}
          },
          buttons:{
            type: Array,
            default: () => []
          }
        },
        data(){
          return{
            loadAll: false
          }
        },
        methods:{
          gridSelect:function (rs) {
            this.$emit('gridSelect', rs);
          }
        }
    }
</script>
