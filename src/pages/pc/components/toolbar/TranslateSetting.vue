<script setup lang="ts">

import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useWindowClick} from "@/hooks/event.ts";
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {ShortcutKey} from "@/types.ts";
import {ElSwitch, ElRadioGroup,ElRadioButton,ElSelect,ElOption} from 'element-plus'

const store = useBaseStore()
const settingStore = useSettingStore()

let show = $ref(false)
let showCustomTranslateModal = $ref(false)

useWindowClick(() => show = false)

function toggle() {
  // if (!show) emitter.emit(EventKey.closeOther)
  // show = !show
  settingStore.translate = !settingStore.translate
}

let translateType = $ref(0)
let networkTranslateEngine = $ref('baidu')
const TranslateEngine = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]

function save() {

}

</script>

<template>
  <div class="setting" @click.stop="null">
    <Tooltip
        :title="`开关释义显示(${settingStore.shortcutKeyMap[ShortcutKey.ToggleShowTranslate]})`"
    >
      <IconWrapper>
        <Icon v-if="settingStore.translate" icon="mdi:translate"
              @click="toggle"
        />
        <Icon v-else icon="mdi:translate-off"
              @click="toggle"
        />
      </IconWrapper>
    </Tooltip>
    <MiniDialog v-model="show"
                style="width: 230rem;"
    >
      <div class="mini-row">
        <label class="item-title">显示翻译</label>
        <div class="wrapper">
          <ElSwitch v-model="settingStore.translate"
                    inline-prompt
                    active-text="开"
                    inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">翻译类型</label>
        <ElRadioGroup v-model="translateType" size="small">
          <ElRadioButton :value="1">本地翻译</ElRadioButton>
          <ElRadioButton :value="0">网络翻译</ElRadioButton>
        </ElRadioGroup>
      </div>
      <div class="mini-row" v-if="translateType">
        <label class="item-title">本地翻译</label>
        <div class="wrapper">
          <Tooltip title="开关释义显示">
            <IconWrapper>
              <Icon icon="mingcute:edit-line"
                    @click="toggle"
              />
            </IconWrapper>
          </Tooltip>
        </div>
      </div>
      <div class="mini-row" v-else>
        <label class="item-title">网络翻译</label>
        <div class="wrapper">
          <ElSelect v-model="networkTranslateEngine" class="m-2" placeholder="Select" size="small">
            <ElOption
                v-for="item in TranslateEngine"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </ElSelect>
        </div>
      </div>
      <div class="footer">
        <BaseButton size="small" @click="show = false">取消</BaseButton>
        <BaseButton size="small" @click="save">确定</BaseButton>
      </div>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">


.setting {
  position: relative;
}

.footer {
  margin-top: .6rem;
  display: flex;
  justify-content: flex-end;
  gap: .6rem;
}
</style>
