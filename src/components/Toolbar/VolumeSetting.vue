<script setup lang="ts">

import MiniModal from "@/components/MiniModal.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";

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
    <Tooltip title="音效设置">
      <IconWrapper>
        <Icon icon="icon-park-outline:volume-notice"
              @click="toggle"
        />
      </IconWrapper>
    </Tooltip>
    <MiniModal v-model="show">
      <div class="mini-row">
        <label class="item-title">按键音</label>
        <div class="wrapper">
          <el-switch v-model="store.setting.keybroadVolume"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">按键音</label>
        <div class="wrapper">
          <el-switch v-model="store.setting.effectVolume"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
    </MiniModal>
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