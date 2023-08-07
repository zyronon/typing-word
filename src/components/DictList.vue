<script setup lang="ts">
import {inject} from "vue"

const next = inject('next')

</script>

<template>
  <div class="dict-wrapper page">
    <div class="tags">
      <div class="tag" :class="i === 5 &&'active'" v-for="i in 2">六级</div>
    </div>
    <div class="dict-list">
      <div class="dict-item" v-for="i in 5" @click="next">
        <div class="name">CET-4</div>
        <div class="desc">大学英语四级词库</div>
        <div class="num">2607词</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dict-wrapper {
  .tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rem;

    .tag {
      cursor: pointer;
      padding: 5rem 10rem;
      border-radius: 20rem;

      &.active {
        background: gray;
        color: whitesmoke;
      }
    }
  }

  .dict-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10rem;

    .dict-item {
      cursor: pointer;
      padding: 10rem;
      border-radius: 10rem;
      border: 1px solid gray;
    }
  }
}

</style>