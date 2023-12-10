<script setup>
import {Icon} from "@iconify/vue";

</script>
<template>
  <div class="page mobile">
    <div class="content">
      <router-view/>
    </div>
    <div class="tabs">
      <div class="tab">
        <Icon width="30" icon="icon-park:word"/>
        <span>单词</span>
      </div>
      <div class="tab">
        <Icon width="30" icon="icon-park:word"/>
        <span>词典</span>
      </div>
      <div class="tab">
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