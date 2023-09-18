<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import AddArticle from "@/components/Practice/AddArticle.vue";

const store = useBaseStore()
let show = $ref(false)

useWindowClick(() => show = false)

function toggle() {
  if (!show) emitter.emit(EventKey.closeOther)
  show = !show
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
    <AddArticle v-if="show" @close="show = false"/>
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