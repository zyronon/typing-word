<script setup lang="ts">
import {ArrowLeft} from '@icon-park/vue-next'
import {inject} from "vue"

const back = inject('back')
const next = inject('next')

</script>

<template>
  <div class="chapter-wrapper page">
    <header>
      <arrow-left @click="back" theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
      <div class="dict-name">CET-4</div>
    </header>
    <div class="chapter-list">
      <div class="chapter-item" v-for="i in 10" @click="next">
        <div class="title">1.A private conversation</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chapter-wrapper {
  header {
    display: flex;
    align-items: center;
    gap: 10rem;
    margin-bottom: 10rem;

    .dict-name {
      font-size: 26rem;
    }
  }


  .chapter-list {
    .chapter-item {
      cursor: pointer;
      margin-bottom: 10rem;
      padding: 10rem;
      border-radius: 10rem;
      border: 1px solid gray;
    }
  }
}
</style>