<script setup lang="ts">

import {Article, DefaultArticle} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import Modal from "@/components/Modal/Modal.vue";
import EditArticle from "@/components/Article/EditArticle.vue";

interface IProps {
  article?: Article
  modelValue: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle),
  modelValue: false
})

</script>

<template>
  <Modal
      :header="false"
      :model-value="props.modelValue"
      :full-screen="true"
  >
    <div class="wrapper">
      <EditArticle
          :article="article"/>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--color-main-bg);
}
</style>