<script setup lang="ts">

import MiniDialog from "@/components/dialog/MiniDialog.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted} from "vue";
import {useSettingStore} from "@/stores/setting.ts";

const store = useBaseStore()
const settingStore = useSettingStore()

let show = $ref(false)
useWindowClick(() => show = false)

let timer = 0

function toggle(val) {
  clearTimeout(timer)
  if (val) {
    emitter.emit(EventKey.closeOther)
    show = val
  } else {
    timer = setTimeout(() => {
      show = val
    }, 100)
  }
}

onMounted(() => {
})
</script>

<template>
  <div class="setting" @click.stop="null">
    <IconWrapper>
      <Icon icon="tabler:repeat"
            @mouseenter="toggle(true)"
            @mouseleave="toggle(false)"
      />
    </IconWrapper>
    <MiniDialog
        v-model="show"
        @mouseenter="toggle(true)"
        @mouseleave="toggle(false)"
        style="width: 230rem;"
    >
      <div class="mini-row-title">
        单词循环设置
      </div>
      <el-radio-group v-model="settingStore.repeatCount">
        <el-radio :label="1" size="default">1</el-radio>
        <el-radio :label="2" size="default">2</el-radio>
        <el-radio :label="3" size="default">3</el-radio>
        <el-radio :label="5" size="default">5</el-radio>
        <el-radio :label="100" size="default">自定义</el-radio>
      </el-radio-group>
      <div class="mini-row" v-if="settingStore.repeatCount === 100">
        <label class="item-title">自定义循环次数</label>
        <el-input-number v-model="settingStore.repeatCustomCount"
                         :min="6"
                         :max="15"
                         type="number"
        />
      </div>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.setting {
  position: relative;

  .title {
    color: black;
  }

  .el-radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>