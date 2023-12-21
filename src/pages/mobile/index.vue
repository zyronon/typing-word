<script setup>
import {Icon} from "@iconify/vue";
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import Home from "@/pages/mobile/Home.vue";
import DictListManage from "@/pages/mobile/DictListManage.vue";
import My from "@/pages/mobile/My.vue";
import {onMounted} from "vue";

defineOptions({
  name: 'Practice'
})

let index = $ref(1)

onMounted(() => {
  console.log('onMounted')
})
</script>
<template>
  <div class="mobile-page mobile">
    <div class="content">
      <SlideHorizontal
          :changeActiveIndexUseAnim="false"
          v-model:index="index">
        <SlideItem>
          <Home/>
        </SlideItem>
        <SlideItem>
          <DictListManage/>
        </SlideItem>
        <SlideItem>
          <My/>
        </SlideItem>
      </SlideHorizontal>
    </div>
    <div class="tabs">
      <div class="tab" @click="index = 0">
        <Icon width="30" icon="icon-park:word"/>
        <span>单词</span>
      </div>
      <div class="tab" @click="index = 1">
        <Icon width="30" icon="icon-park:word"/>
        <span>词典</span>
      </div>
      <div class="tab" @click="index = 2">
        <Icon width="30" icon="icon-park:word"/>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile {

  .content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .tabs {
    border-top: 1px solid gray;
    height: 60rem;
    display: flex;
    align-items: center;

    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 14rem;
    }
  }
}
</style>