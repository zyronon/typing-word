<script setup lang="ts">

import MiniModal from "@/components/MiniModal.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import VolumeIcon from "@/components/VolumeIcon.vue";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {SoundFileOptions} from "@/utils/const.ts";

const settingStore = useSettingStore()

let show = $ref(false)

useWindowClick(() => show = false)
useWatchAllSound()

function toggle() {
  if (!show) emitter.emit(EventKey.closeOther)
  show = !show
}

</script>

<template>
  <div class="setting"
       @click.stop="null">
    <Tooltip title="音效设置">
      <IconWrapper>
        <Icon v-if="settingStore.allSound" icon="icon-park-outline:volume-notice"
              @click="toggle"
        />
        <Icon v-else icon="icon-park-outline:volume-mute"
              @click="toggle"
        />
      </IconWrapper>
    </Tooltip>
    <MiniModal
        width="250rem"
        v-model="show">
      <div class="mini-row">
        <label class="item-title">所有音效</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.allSound"
                     @change="useChangeAllSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">单词/句子自动发音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.wordSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">单词/句子发音口音</label>
        <div class="wrapper">
          <el-select v-model="settingStore.wordSoundType"
                     placeholder="请选择"
                     size="small">
            <el-option label="美音" value="us"/>
            <el-option label="英音" value="uk"/>
          </el-select>
        </div>
      </div>
<!--      <div class="mini-row">-->
<!--        <label class="item-title">释义发音</label>-->
<!--        <div class="wrapper">-->
<!--          <el-switch v-model="settingStore.translateSound"-->
<!--                     inline-prompt-->
<!--                     active-text="开"-->
<!--                     inactive-text="关"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
      <div class="mini-row">
        <label class="item-title">按键音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.keyboardSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">按键音效</label>
        <div class="wrapper">
          <el-select v-model="settingStore.keyboardSoundFile"
                     placeholder="请选择"
                     size="small">
            <el-option
                v-for="item in SoundFileOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
              <div class="el-option-row">
                <span>{{ item.label }}</span>
                <VolumeIcon
                    :time="100"
                    @click="usePlayAudio(getAudioFileUrl(item.value)[0])"/>
              </div>
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">效果音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.effectSound"
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
  width: 100rem;
  position: relative;
  text-align: right;
}

.setting {
  position: relative;
}

.el-option-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .icon-wrapper {
    transform: translateX(10rem);
  }
}
</style>