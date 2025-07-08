<script setup lang="ts">

import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {SoundFileOptions} from "@/utils/const.ts";

const settingStore = useSettingStore()

let show = $ref(false)

useWindowClick(() => show = false)
useWatchAllSound()

let timer = 0

function toggle(val: boolean) {
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


function toggle2() {
  if (!show){
    emitter.emit(EventKey.closeOther)
  }
  show = !show
}


</script>

<template>
  <div class="setting"
       @click.stop="null"
  >
    <Tooltip title="音效设置">
      <IconWrapper>
        <Icon v-if="settingStore.allSound" icon="icon-park-outline:volume-notice"
              @click="toggle2()"
        />
        <Icon v-else icon="icon-park-outline:volume-mute"
              @click="toggle2()"
        />
      </IconWrapper>
    </Tooltip>
    <MiniDialog
        width="12rem"
        v-model="show">
      <div class="mini-row-title">
        音效设置
      </div>
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
        <label class="item-title">自动发音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.wordSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">口音</label>
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
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">


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
