<script setup lang="ts">

import {Article, DefaultArticle} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import EditArticle from "@/pages/pc/components/article/EditArticle.vue";
import {useDisableEventListener} from "@/hooks/event.ts";

interface IProps {
  article?: Article
  modelValue: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle),
  modelValue: false
})
const emit = defineEmits<{
  save: [val: Article]
  'update:modelValue': [val: boolean]
}>()

useDisableEventListener(() => props.modelValue)

</script>

<template>
  <Dialog
      :header="false"
      :model-value="props.modelValue"
      @close="emit('update:modelValue',false)"
      :full-screen="true"
  >
    <div class="wrapper">
      <EditArticle
          :article="article"
          @save="val => emit('save',val)"
      />
    </div>
  </Dialog>
</template>

<style scoped lang="scss">

.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--color-main-bg);
}
</style>
