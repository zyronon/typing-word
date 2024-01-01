<script setup lang="ts">

import NavBar from "@/pages/mobile/components/NavBar.vue";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio} from "@/hooks/sound.ts";
import {SoundFileOptions} from "@/utils/const.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useBaseStore} from "@/stores/base.ts";
import {ShortcutKey} from "@/types.ts";

const settingStore = useSettingStore()
const store = useBaseStore()
</script>

<template>
  <div class="mobile-page">
    <NavBar title="其他设置"/>
    <div class="page-content">
      <div class="row">
        <label class="item-title">显示上一个/下一个单词</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.showNearWord"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="desc">
        开启后，练习中会在上方显示上一个/下一个单词
      </div>
      <div class="line"></div>
      <div class="row">
        <label class="item-title">忽略大小写</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.ignoreCase"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="desc">
        开启后，输入时不区分大小写，如输入“hello”和“Hello”都会被认为是正确的
      </div>
      <div class="line"></div>
      <div class="row">
        <label class="item-title">允许默写模式下显示提示</label>
        <div class="wrapper">
          <el-switch v-model="settingStore.allowWordTip"
                     inline-prompt
                     active-text="开"
                     inactive-text="关"
          />
        </div>
      </div>
      <div class="desc">
        开启后，可以通过鼠标 hover 单词或者按 {{ settingStore.shortcutKeyMap[ShortcutKey.ShowWord] }} 显示正确答案
      </div>
      <div class="line"></div>
      <div class="row">
        <label class="item-title">字体设置(仅可调整单词练习)</label>
      </div>
      <div class="row">
        <label class="sub-title">外语字体</label>
        <div class="wrapper">
          <el-slider
              :min="10"
              :max="100"
              v-model="settingStore.fontSize.wordForeignFontSize"/>
          <span>{{ settingStore.fontSize.wordForeignFontSize }}</span>
        </div>
      </div>
      <div class="row">
        <label class="sub-title">中文字体</label>
        <div class="wrapper">
          <el-slider
              :min="10"
              :max="100"
              v-model="settingStore.fontSize.wordTranslateFontSize"/>
          <span>{{ settingStore.fontSize.wordTranslateFontSize }}</span>
        </div>
      </div>

      <div class="line"></div>
      <div class="row">
        <label class="item-title">其他设置</label>
      </div>
      <div class="row">
        <label class="sub-title">切换下一个单词时间</label>
        <div class="wrapper">
          <el-input-number v-model="settingStore.waitTimeForChangeWord"
                           :min="6"
                           :max="100"
                           type="number"
          />
          <span>毫秒</span>
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