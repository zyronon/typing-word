<script setup>
import {Icon} from "@iconify/vue";
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import Home from "@/pages/mobile/Home.vue";
import DictManage from "@/pages/mobile/DictManage.vue";
import Setting from "@/pages/mobile/Setting.vue";

let state = $ref({
  baseIndex: 0
})
</script>
<template>
  <div class="page mobile">
    <div class="content">
      <SlideHorizontal
          :slide="false"
          v-model:index="state.baseIndex">
        <SlideItem>
          <Home/>
        </SlideItem>
        <SlideItem>
          <DictManage/>
        </SlideItem>
        <SlideItem>
          <Setting/>
        </SlideItem>
      </SlideHorizontal>
    </div>
    <div class="tabs">
      <div class="tab" @click="state.baseIndex = 0">
        <Icon width="30" icon="icon-park:word"/>
        <span>单词</span>
      </div>
      <div class="tab" @click="state.baseIndex = 1">
        <Icon width="30" icon="icon-park:word"/>
        <span>词典</span>
      </div>
      <div class="tab" @click="state.baseIndex = 2">
        <Icon width="30" icon="icon-park:word"/>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile {
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
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