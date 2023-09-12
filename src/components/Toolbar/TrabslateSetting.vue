<script setup lang="ts">

import MiniModal from "@/components/MiniModal.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import BaseButton from "@/components/BaseButton.vue";

const store = useBaseStore()
let show = $ref(false)

useWindowClick(() => show = false)

function toggle() {
  if (!show) emitter.emit(EventKey.closeOther)
  show = !show
}

let translateType = $ref(0)
let networkTranslateEngine = $ref('baidu')
const TranslateEngine = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]
</script>

<template>
  <div class="setting" @click.stop="null">
    <Tooltip title="开关释义显示">
      <IconWrapper>
        <Icon v-if="store.setting.translate" icon="mdi:translate"
              @click="toggle"
        />
        <Icon v-else icon="mdi:translate-off"
              @click="toggle"
        />
      </IconWrapper>
    </Tooltip>
    <MiniModal v-model="show"
               style="width: 230rem;"
    >
      <div class="mini-row">
        <label class="item-title">显示翻译</label>
        <div class="wrapper">
          <el-switch v-model="store.setting.translate"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">翻译类型</label>
        <el-radio-group v-model="translateType" size="small">
          <el-radio-button :label="0">本地翻译</el-radio-button>
          <el-radio-button :label="1">网络翻译</el-radio-button>
        </el-radio-group>
      </div>
      <div class="mini-row">
        <label class="item-title">本地翻译</label>
        <div class="wrapper">
          <Icon icon="mingcute:edit-line"
                @click="toggle"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">网络翻译</label>
        <div class="wrapper">
          <el-select v-model="networkTranslateEngine" class="m-2" placeholder="Select" size="small">
            <el-option
                v-for="item in TranslateEngine"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="footer">
        <BaseButton>取消</BaseButton>
        <BaseButton>确定</BaseButton>
      </div>
    </MiniModal>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.setting {
  position: relative;
}

.footer {
  margin-top: 10rem;
  display: flex;
  justify-content: flex-end;
}
</style>