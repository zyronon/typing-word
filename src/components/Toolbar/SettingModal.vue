<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue"
import {useBaseStore} from "@/stores/base.ts"
import {Icon} from '@iconify/vue';
import {watch, ref} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {useChangeAllSound, useWatchAllSound} from "@/hooks/sound.ts";
import {useDisableEventListener, useEventListener} from "@/hooks/event.ts";
import {$computed, $ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {DefaultShortcutKeyMap} from "@/types.ts";

const tabIndex = $ref(2)
const settingStore = useSettingStore()
//@ts-ignore
const gitLastCommitHash = ref(LATEST_COMMIT_HASH);

const emit = defineEmits([
  'close',
])

useDisableEventListener()
useWatchAllSound()

let editShortcutKey = $ref('')

useEventListener('keydown', (e: KeyboardEvent) => {
  console.log('e', e, e.keyCode, e.ctrlKey, e.altKey, e.shiftKey)
  if (!editShortcutKey) return
  e.preventDefault()

  let shortcutKey = ''
  if (e.ctrlKey) shortcutKey += 'Ctrl+'
  if (e.altKey) shortcutKey += 'Alt+'
  if (e.shiftKey) shortcutKey += 'Shift+'
  if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      shortcutKey += e.key.toUpperCase()
    } else {
      shortcutKey += e.key
    }
  }
  shortcutKey = shortcutKey.trim()

  if (editShortcutKey) {
    for (const [k, v] of Object.entries(settingStore.shortcutKeyMap)) {
      if (v === shortcutKey && k !== editShortcutKey) {
        settingStore.shortcutKeyMap[editShortcutKey] = DefaultShortcutKeyMap[editShortcutKey]
        return ElMessage.warning('快捷键重复！')
      }
    }
    settingStore.shortcutKeyMap[editShortcutKey] = shortcutKey
  }

  console.log('key', shortcutKey)
})

</script>

<template>
  <Modal
      @close="emit('close')"
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
            <Icon icon="icon-park-outline:setting-config" width="20" color="#0C8CE9"/>
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
            <label class="item-title">单词发音</label>
            <div class="wrapper">
              <el-switch v-model="settingStore.wordSound"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
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
              <el-slider v-model="settingStore.wordSoundSpeed" :step="0.1" :min="0.5" :max="4"/>
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
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="settingStore.keyboardSoundVolume"/>
              <span>{{ settingStore.keyboardSoundVolume }}%</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">释义发音</label>
            <div class="wrapper">
              <el-switch v-model="settingStore.translateSound"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="settingStore.translateSoundVolume"/>
              <span>{{ settingStore.translateSoundVolume }}%</span>
            </div>
          </div>
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
            <label class="item-title">章节乱序</label>
            <div class="wrapper">
              <el-switch v-model="settingStore.show"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="desc">
            开启后，每次练习章节中单词会随机排序。下一章节生效
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">练习时展示上一个/下一个单词</label>
            <div class="wrapper">
              <el-switch v-model="settingStore.showNearWord"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="desc">
            开启后，练习中会在上方展示上一个/下一个单词
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">是否忽略大小写</label>
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
            <label class="item-title">是否允许默写模式下显示提示</label>
            <div class="wrapper">
              <el-switch v-model="settingStore.allowWordTip"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="desc">
            开启后，可以通过鼠标 hover 单词或者按 Esc键 显示正确答案
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">字体设置(仅可调整单词练习)</label>
          </div>
          <div class="row">
            <label class="sut-title">外语字体</label>
            <div class="wrapper">
              <el-slider
                  :min="10"
                  :max="100"
                  v-model="settingStore.fontSize.wordForeignFontSize"/>
              <span>{{ settingStore.fontSize.wordForeignFontSize }}</span>
            </div>
          </div>
          <div class="row">
            <label class="sut-title">中文字体</label>
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
            <label class="sut-title">切换下一个单词时间</label>
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
        <div v-if="tabIndex === 2">
          <div class="row">
            <label class="item-title">功能</label>
            <div class="wrapper">快捷键(点击可修改)</div>
          </div>
          <div class="row" v-for="item of Object.entries(settingStore.shortcutKeyMap)">
            <label class="item-title">{{ item[0] }}</label>
            <div class="wrapper" @click="editShortcutKey = item[0]">
              <div class="set-key" v-if="editShortcutKey === item[0]">
                <input :value="item[1]" readonly type="text" @blur="editShortcutKey = ''">
                <span @click.stop="editShortcutKey = ''">直接按键盘进行设置</span>
              </div>
              <div v-else> {{ item[1] }}</div>
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
    padding: 0 $space;
    overflow: auto;

    .row {
      height: 50rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: $space * 5;

      .wrapper {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: $space;

        span {
          text-align: right;
          width: 30rem;
          font-size: 12rem;
          color: gray;
        }

        .set-key {
          align-items: center;

          input {
            width: 150rem;
            margin-right: 10rem;
            height: 24rem;
            outline: none;
            font-size: 16rem;
          }
        }
      }

      .main-title {
        font-size: 26rem;
        font-weight: bold;
      }

      .item-title {
        font-size: 22rem;
      }

      .sub-title {
        font-size: 18rem;
      }
    }

    .desc {
      margin-bottom: 10rem;
      font-size: 14rem;
    }

    .line {
      border-bottom: 1px solid #c4c3c3;
    }
  }
}

</style>