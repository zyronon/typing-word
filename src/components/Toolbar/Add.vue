<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import EditBatchArticleModal from "@/components/Article/EditBatchArticleModal.vue";
import {$ref} from "vue/macros";

let show = $ref(false)

function toggle() {
  show = !show
  // emitter.emit(EventKey.openArticleListModal)
}
</script>

<template>
  <div class="setting" @click.stop="null">
    <Tooltip title="添加">
      <IconWrapper>
        <Icon icon="ic:outline-cloud-upload"
              @click="toggle"
        />
      </IconWrapper>
    </Tooltip>
    <EditBatchArticleModal/>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.wrapper {
  position: relative;
}

.setting {
  position: relative;

}
</style>