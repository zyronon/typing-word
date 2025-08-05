<script setup lang="ts">

import {Article} from "@/types/types.ts";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {useDisableEventListener} from "@/hooks/event.ts";
import EditArticle2 from "@/pages/pc/article/components/EditArticle2.vue";
import {getDefaultArticle} from "@/types/func.ts";

interface IProps {
  article?: Article
  modelValue: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => getDefaultArticle(),
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
      <EditArticle2
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
  background: var(--color-primary);
}
</style>
