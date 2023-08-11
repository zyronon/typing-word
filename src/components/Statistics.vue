<script setup>
import Modal from "@/components/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";
import {Close} from '@icon-park/vue-next'
import Ring from "@/components/Ring.vue";

const store = useBaseStore()
</script>

<template>
  <Modal v-model="store.dictModalIsOpen2">
    <div class="statistics">
      <header>
        <div class="title">新概念英语-2 第3章</div>
        <close @click="store.dictModalIsOpen2 = false" theme="outline" size="20" fill="#929596"
               :strokeWidth="2"/>
      </header>
      <div class="content">
        <div class="rings">
          <Ring/>
          <Ring/>
          <Ring/>
        </div>
        <div class="result">
          <div class="wrong-words">

          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
<style scoped lang="scss">
.statistics {
  width: 50vw;
  height: 70vh;

  header {
    display: flex;
    align-items: center;
    justify-content: center;

  }

  .content {

  }
}
</style>