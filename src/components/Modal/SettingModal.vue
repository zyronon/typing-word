<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue"
import {useBaseStore} from "@/stores/base.ts"
import {Icon} from '@iconify/vue';
import {watch, ref} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {getShortcutKey, useDisableEventListener, useEventListener} from "@/hooks/event.ts";
import {$computed, $ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {DefaultShortcutKeyMap, ShortcutKey} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {SoundFileOptions} from "@/utils/const.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";

const tabIndex = $ref(0)
const settingStore = useSettingStore()
//@ts-ignore
const gitLastCommitHash = ref(LATEST_COMMIT_HASH);

const emit = defineEmits([
  'close',
])

useDisableEventListener()
useWatchAllSound()

let editShortcutKey = $ref('')

const disabledDefaultKeyboardEvent = $computed(() => {
  return editShortcutKey && tabIndex === 2
})

useEventListener('keydown', (e: KeyboardEvent) => {
  if (!disabledDefaultKeyboardEvent) return
  e.preventDefault()

  let shortcutKey = getShortcutKey(e)
  // console.log('e', e, e.keyCode, e.ctrlKey, e.altKey, e.shiftKey)
  // console.log('key', shortcutKey)

  // if (shortcutKey[shortcutKey.length-1] === '+') {
  //   settingStore.shortcutKeyMap[editShortcutKey] = DefaultShortcutKeyMap[editShortcutKey]
  //   return ElMessage.warning('设备失败！')
  // }

  if (editShortcutKey) {
    if (shortcutKey === 'Delete') {
      settingStore.shortcutKeyMap[editShortcutKey] = ''
    } else {
      for (const [k, v] of Object.entries(settingStore.shortcutKeyMap)) {
        if (v === shortcutKey && k !== editShortcutKey) {
          settingStore.shortcutKeyMap[editShortcutKey] = DefaultShortcutKeyMap[editShortcutKey]
          return ElMessage.warning('快捷键重复！')
        }
      }
      settingStore.shortcutKeyMap[editShortcutKey] = shortcutKey
    }
  }
})

function resetShortcutKeyMap() {
  editShortcutKey = ''
  settingStore.shortcutKeyMap = cloneDeep(DefaultShortcutKeyMap)
  ElMessage.success('恢复成功')
}

</script>

<template>
  <Modal
      @close="emit('close')"
      :keyboard="!disabledDefaultKeyboardEvent"
      title="设置">
    <div class="setting-modal">
      <div class="left">
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
            <Icon icon="bx:headphone" width="20" color="#0C8CE9"/>
            <span>音效设置</span>
          </div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">
            <Icon icon="icon-park-outline:setting-config" width="20" color="#0C8CE9"/>
            <span>其他设置</span>
          </div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">
            <Icon icon="material-symbols:keyboard-outline" width="20" color="#0C8CE9"/>
            <span>快捷键设置</span>
          </div>
        </div>
        <div class="git-log">
          Build {{ gitLastCommitHash }}
        </div>
      </div>
      <div class="content">
        <div v-if="tabIndex === 0">
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
        <div v-if="tabIndex === 1">
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
        <div class="body" v-if="tabIndex === 2">
          <div class="row">
            <label class="main-title">功能</label>
            <div class="wrapper">快捷键(点击可修改)</div>
          </div>
          <div class="scroll">
            <div class="row" v-for="item of Object.entries(settingStore.shortcutKeyMap)">
              <label class="item-title">{{ $t(item[0]) }}</label>
              <div class="wrapper" @click="editShortcutKey = item[0]">
                <div class="set-key" v-if="editShortcutKey === item[0]">
                  <input :value="item[1]?item[1]:'未设置快捷键'" readonly type="text" @blur="editShortcutKey = ''">
                  <span @click.stop="editShortcutKey = ''">直接按键盘进行设置</span>
                </div>
                <div v-else>
                  <div v-if="item[1]">{{ item[1] }}</div>
                  <span v-else>未设置快捷键</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row footer">
            <label class="item-title"></label>
            <div class="wrapper">
              <BaseButton @click="resetShortcutKeyMap">恢复默认</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.setting-modal {
  width: 40vw;
  height: 70vh;
  display: flex;
  color: var(--color-font-1);

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .tabs {
      padding: 10rem 20rem;
      display: flex;
      flex-direction: column;
      //align-items: center;
      //justify-content: center;
      gap: 10rem;

      .tab {
        cursor: pointer;
        padding: 10rem 15rem;
        border-radius: 8rem;
        display: flex;
        align-items: center;
        gap: 10rem;

        &.active {
          background: var(--color-item-bg);
        }
      }
    }

    .git-log {
      font-size: 10rem;
      color: gray;
      margin-bottom: 5rem;
    }
  }

  .content {
    background: var(--color-header-bg);
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 var(--space);

    .row {
      height: 40rem;
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
        font-size: 18rem;
        font-weight: bold;
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