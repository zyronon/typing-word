<script setup lang="ts">

import Dialog from "@/components/dialog/Dialog.vue";
import {$ref} from "vue/macros";
import {onMounted, onUnmounted, watch} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import WordList from "@/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";

let show = $ref(false)
let list = $ref([])
let title = $ref('')

onMounted(() => {
  emitter.on(EventKey.openWordListModal, (val: any) => {
    show = true
    list = val.list
    title = val.title + `(${list.length}词)`
  })
})

watch(() => show, v => {
  if (!v) {
    list = []
  }
})

onUnmounted(() => {
  emitter.off(EventKey.openWordListModal)
})

</script>

<template>
  <Dialog
      :title="title"
      v-model="show">
    <div class="all-word">
      <WordList
          v-if="list.length"
          class="word-list"
          :list="list">
      </WordList>
      <Empty v-else/>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
@import "@/assets/css/style";

.all-word {
  padding-bottom: var(--space);
  padding-top: 0;
  width: 400rem;
  height: 75vh;
  display: flex;
}
</style>
