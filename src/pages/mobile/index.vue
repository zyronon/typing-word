<script setup>
import {Icon} from "@iconify/vue";
import Home from "@/pages/mobile/Home.vue";
import DictListManage from "@/pages/mobile/DictListManage.vue";
import My from "@/pages/mobile/my/My.vue";
import {onMounted} from "vue";

defineOptions({
  name: 'Practice'
})

let index = $ref(2)

onMounted(() => {
  console.log('onMounted')
})
</script>
<template>
  <div class="mobile-page mobile">
    <div class="content">
      <Home v-if="index === 0 "/>
      <DictListManage v-if="index === 1"/>
      <My v-if="index === 2"/>
    </div>
    <div class="tabs">
      <div class="tab" @click="index = 0">
        <Icon width="30" icon="ph:exam"/>
        <span>单词</span>
      </div>
      <div class="tab" @click="index = 1">
        <Icon width="30" icon="iconoir:book"/>
        <span>词典</span>
      </div>
      <div class="tab" @click="index = 2">
        <Icon width="30" icon="iconoir:user"/>
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
    border-top: 1px solid var(--color-item-bg);
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