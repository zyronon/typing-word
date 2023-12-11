<script setup lang="ts">

import DictManage from "@/pages/pc/dict/DictManage.vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import RightTopBar from "@/components/RightTopBar.vue";
import Logo from "@/components/Logo.vue";

const router = useRoute()
const runtimeStore = useRuntimeStore()
onMounted(() => {

})
</script>

<template>
  <div class="anim page">
    <header class="anim">
      <Logo/>
      <div class="nav-list">
        <nav>
          <router-link to="/pc/practice">练习</router-link>
        </nav>
        <nav class="active">
          <router-link to="/pc/dict">词典</router-link>
        </nav>
        <nav @click.stop="runtimeStore.showSettingModal = true"><a href="javascript:void(0)">设置</a></nav>
      </div>
      <RightTopBar/>
    </header>
    <div class="content">
      <DictManage/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {

  header {
    background: var(--color-second-bg);
    height: 60rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid var(--color-item-border);

    .nav-list {
      display: flex;
      gap: 10rem;

      nav {
        padding: 7rem 20rem;
        cursor: pointer;
        font-size: 16rem;
        transition: all .3s;

        &:hover {
        }

        &.active {
          border-bottom: 2px solid var(--color-main-active);
        }

        a {
          color: var(--color-font-1);
        }
      }
    }
  }
}

</style>

