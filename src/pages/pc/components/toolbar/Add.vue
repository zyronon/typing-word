<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";


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
  </div>
</template>

<style scoped lang="scss">


.wrapper {
  position: relative;
}

.setting {
  position: relative;

}
</style>
