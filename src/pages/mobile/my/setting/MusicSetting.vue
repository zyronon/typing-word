<script setup lang="ts">

import NavBar from "@/pages/mobile/components/NavBar.vue";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio} from "@/hooks/sound.ts";
import {SoundFileOptions} from "@/utils/const.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useBaseStore} from "@/stores/base.ts";

const settingStore = useSettingStore()
const store = useBaseStore()
</script>

<template>
  <div class="mobile-page">
    <NavBar title="音效设置"/>
    <div class="page-content">
      <div class="row">
        <label class="main-title">所有音效</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.allSound"
                     @change="useChangeAllSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="line"></div>
      <div class="row">
        <label class="item-title">单词/句子自动发音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.wordSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="row">
        <label class="sub-title">单词/句子发音口音</label>
        <div class="wrapper">
          <el-select v-model="settingStore.wordSoundType"
                     placeholder="请选择"
          >
            <el-option label="美音" value="us"/>
            <el-option label="英音" value="uk"/>
          </el-select>
        </div>
      </div>
      <div class="row">
        <label class="sub-title">音量</label>
        <div class="wrapper">
          <el-slider v-model="settingStore.wordSoundVolume"/>
          <span>{{ settingStore.wordSoundVolume }}%</span>
        </div>
      </div>
      <div class="row">
        <label class="sub-title">倍速</label>
        <div class="wrapper">
          <el-slider v-model="settingStore.wordSoundSpeed" :step="0.1" :min="0.5" :max="3"/>
          <span>{{ settingStore.wordSoundSpeed }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="row">
        <label class="item-title">按键音</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.keyboardSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="row">
        <label class="item-title">按键音效</label>
        <div class="wrapper">
          <el-select v-model="settingStore.keyboardSoundFile"
                     placeholder="请选择"
          >
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
      <div class="row">
        <label class="sub-title">音量</label>
        <div class="wrapper">
          <el-slider v-model="settingStore.keyboardSoundVolume"/>
          <span>{{ settingStore.keyboardSoundVolume }}%</span>
        </div>
      </div>
      <div class="line"></div>
      <!--          <div class="row">-->
      <!--            <label class="item-title">释义发音</label>-->
      <!--            <div class="wrapper">-->
      <!--              <el-switch v-model="settingStore.translateSound"-->
      <!--                         inline-prompt-->
      <!--                         active-text="开"-->
      <!--                         inactive-text="关"-->
      <!--              />-->
      <!--            </div>-->
      <!--          </div>-->
      <!--          <div class="row">-->
      <!--            <label class="sub-title">音量</label>-->
      <!--            <div class="wrapper">-->
      <!--              <el-slider v-model="settingStore.translateSoundVolume"/>-->
      <!--              <span>{{ settingStore.translateSoundVolume }}%</span>-->
      <!--            </div>-->
      <!--          </div>-->
      <div class="line"></div>
      <div class="row">
        <label class="item-title">效果音（章节结算页烟花音效）</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.effectSound"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="row">
        <label class="sub-title">音量</label>
        <div class="wrapper">
          <el-slider v-model="settingStore.effectSoundVolume"/>
          <span>{{ settingStore.effectSoundVolume }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-content {
  background: var(--color-header-bg);
  flex: 1;
  height: 100%;
  overflow: auto;
  padding: 10rem var(--space);

  .row {
    min-height: 40rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: calc(var(--space) * 5);

    .wrapper {
      height: 30rem;
      flex: 1;
      display: flex;
      justify-content: flex-end;
      gap: var(--space);

      span {
        text-align: right;
        //width: 30rem;
        font-size: 12rem;
        color: gray;
      }

      .set-key {
        align-items: center;

        input {
          width: 150rem;
          box-sizing: border-box;
          margin-right: 10rem;
          height: 28rem;
          outline: none;
          font-size: 16rem;
          border: 1px solid gray;
          border-radius: 3rem;
          padding: 0 5rem;
          background: var(--color-second-bg);
          color: var(--color-font-1);
        }
      }
    }

    .main-title {
      font-size: 22rem;
    }

    .item-title {
      font-size: 16rem;
    }

    .sub-title {
      font-size: 14rem;
    }
  }

  .body {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .scroll {
    flex: 1;
    padding-right: 10rem;
    overflow: auto;
  }

  .footer {
    margin-bottom: 20rem;
  }

  .desc {
    margin-bottom: 10rem;
    font-size: 12rem;
  }

  .line {
    border-bottom: 1px solid #c4c3c3;
  }
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