<script setup>
import {Icon} from "@iconify/vue";

</script>
<template>
  <div class="mobile">
    <div class="content">
      <router-view/>
    </div>
    <div class="tabs">
      <div class="tab">
        <Icon icon="icon-park:word"/>
        <span>单词</span>
      </div>
      <div class="tab">
        <Icon icon="icon-park:word"/>
        <span>词典</span>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">
.mobile {
  position: relative;
  z-index: 1;
  font-size: 14rem;
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;

  .content {
    flex: 1;
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
    }
  }
}
</style>