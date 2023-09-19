<script setup lang="ts">

import MiniModal from "@/components/MiniModal.vue";
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
let radio1 = $ref('1')
useWindowClick(() => show = false)

function toggle() {
  if (!show) emitter.emit(EventKey.closeOther)
  show = !show
}

onMounted(() => {
})
</script>

<template>
  <div class="setting" @click.stop="null">
    <Tooltip title="单词循环设置">
      <IconWrapper>
        <Icon icon="tabler:repeat"
              @click="toggle"/>
      </IconWrapper>
    </Tooltip>
    <MiniModal
        v-model="show"
        style="width: 230rem;"
    >
      <div class="title">选择单词的循环次数</div>
      <el-radio-group v-model="settingStore.repeatCount">
        <el-radio :label="1" size="default">1</el-radio>
        <el-radio :label="2" size="default">2</el-radio>
        <el-radio :label="3" size="default">3</el-radio>
        <el-radio :label="5" size="default">5</el-radio>
        <el-radio :label="100" size="default">自定义</el-radio>
      </el-radio-group>
      <div class="mini-row" v-if="settingStore.repeatCount === 100">
        <label class="item-title">自定义循环次数</label>
        <el-input-number  v-model="settingStore.repeatCustomCount"
                  :min="6"
                  :max="100"
                  type="number"
        />
      </div>
    </MiniModal>
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