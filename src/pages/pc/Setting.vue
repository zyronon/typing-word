<script setup lang="ts">
import {Icon} from '@iconify/vue';
import {ref, watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {getShortcutKey, useDisableEventListener, useEventListener} from "@/hooks/event.ts";
import {cloneDeep} from "@/utils";
import {DefaultShortcutKeyMap, ShortcutKey} from "@/types/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {APP_NAME, EXPORT_DATA_KEY, SAVE_DICT_KEY, SAVE_SETTING_KEY, SoundFileOptions} from "@/utils/const.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {useBaseStore} from "@/stores/base.ts";
import {saveAs} from "file-saver";
import {checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting, shakeCommonDict} from "@/utils";
import {GITHUB} from "@/config/ENV.ts";
import dayjs from "dayjs";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {ElSwitch, ElSelect, ElOption, ElSlider, ElRadioGroup, ElRadio, ElInputNumber} from 'element-plus'

const emit = defineEmits<{
  toggleDisabledDialogEscKey: [val: boolean]
}>()

const tabIndex = $ref(0)
const settingStore = useSettingStore()
const store = useBaseStore()
//@ts-ignore
const gitLastCommitHash = ref(LATEST_COMMIT_HASH);

useDisableEventListener(() => undefined)
useWatchAllSound()

let editShortcutKey = $ref('')

const disabledDefaultKeyboardEvent = $computed(() => {
  return editShortcutKey && tabIndex === 2
})

watch(() => disabledDefaultKeyboardEvent, v => {
  emit('toggleDisabledDialogEscKey', !!v)
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

function exportData() {
  let data = {
    version: EXPORT_DATA_KEY.version,
    val: {
      setting: {
        version: SAVE_SETTING_KEY.version,
        val: settingStore.$state
      },
      dict: {
        version: SAVE_DICT_KEY.version,
        val: shakeCommonDict(store.$state)
      }
    }
  }
  let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, `${APP_NAME}-User-Data-${dayjs().format('YYYY-MM-DD HH-mm-ss')}.json`);
  ElMessage.success('导出成功！')
}

function importData(e) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader();
  reader.onload = function (v) {
    let str: any = v.target.result;
    if (str) {
      let obj = {
        version: -1,
        val: {
          setting: {},
          dict: {},
        }
      }
      try {
        obj = JSON.parse(str)
        let data = obj.val
        let settingState = checkAndUpgradeSaveSetting(data.setting)
        settingStore.setState(settingState)
        let baseState = checkAndUpgradeSaveDict(data.dict)
        store.setState(baseState)
        ElMessage.success('导入成功！')
      } catch (err) {
        return ElMessage.error('导入失败！')
      }
    }
  }
  reader.readAsText(file);
}
</script>

<template>
  <BasePage>
    <div class="setting text-md">
      <div class="left mt-10">
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
            <Icon icon="bx:headphone" width="20"/>
            <span>音效设置</span>
          </div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">
            <Icon icon="icon-park-outline:setting-config" width="20"/>
            <span>练习设置</span>
          </div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">
            <Icon icon="material-symbols:keyboard-outline" width="20"/>
            <span>快捷键设置</span>
          </div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">
            <Icon icon="mdi:database-cog-outline" width="20"/>
            <span>数据管理</span>
          </div>
          <div class="tab" :class="tabIndex === 4 && 'active'" @click="tabIndex = 4">
            <Icon icon="mingcute:service-fill" width="20"/>
            <span>反馈</span>
          </div>
          <div class="tab" :class="tabIndex === 5 && 'active'" @click="tabIndex = 5">
            <Icon icon="mdi:about-circle-outline" width="20"/>
            <span>关于</span>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="page-title text-align-center">设置</div>
        <div v-if="tabIndex === 0">
          <div class="row">
            <label class="main-title">所有音效</label>
            <div class="wrapper">
              <ElSwitch v-model="settingStore.allSound"
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
              <ElSwitch v-model="settingStore.wordSound"
                        inline-prompt
                        active-text="开"
                        inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">单词/句子发音口音</label>
            <div class="wrapper">
              <ElSelect v-model="settingStore.wordSoundType"
                        placeholder="请选择"
              >
                <ElOption label="美音" value="us"/>
                <ElOption label="英音" value="uk"/>
              </ElSelect>
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <ElSlider v-model="settingStore.wordSoundVolume"/>
              <span>{{ settingStore.wordSoundVolume }}%</span>
            </div>
          </div>
          <div class="row">
            <label class="sub-title">倍速</label>
            <div class="wrapper">
              <ElSlider v-model="settingStore.wordSoundSpeed" :step="0.1" :min="0.5" :max="3"/>
              <span>{{ settingStore.wordSoundSpeed }}</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">按键音</label>
            <div class="wrapper">
              <ElSwitch v-model="settingStore.keyboardSound"
                        inline-prompt
                        active-text="开"
                        inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="item-title">按键音效</label>
            <div class="wrapper">
              <ElSelect v-model="settingStore.keyboardSoundFile"
                        placeholder="请选择"
              >
                <ElOption
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
                </ElOption>
              </ElSelect>
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <ElSlider v-model="settingStore.keyboardSoundVolume"/>
              <span>{{ settingStore.keyboardSoundVolume }}%</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">效果音（输入错误、完成时的音效）</label>
            <div class="wrapper">
              <ElSwitch v-model="settingStore.effectSound"
                        inline-prompt
                        active-text="开"
                        inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <ElSlider v-model="settingStore.effectSoundVolume"/>
              <span>{{ settingStore.effectSoundVolume }}%</span>
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 1">
          <div class="row">
            <label class="item-title">单词循环设置</label>
            <div class="wrapper">
              <ElRadioGroup v-model="settingStore.repeatCount">
                <ElRadio :value="1" size="default">1</ElRadio>
                <ElRadio :value="2" size="default">2</ElRadio>
                <ElRadio :value="3" size="default">3</ElRadio>
                <ElRadio :value="5" size="default">5</ElRadio>
                <ElRadio :value="100" size="default">自定义</ElRadio>
              </ElRadioGroup>
              <div class="mini-row" v-if="settingStore.repeatCount === 100">
                <label class="item-title">循环次数</label>
                <ElInputNumber v-model="settingStore.repeatCustomCount"
                               :min="6"
                               :max="15"
                               type="number"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <label class="item-title">显示上一个/下一个单词</label>
            <div class="wrapper">
              <ElSwitch v-model="settingStore.showNearWord"
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
              <ElSwitch v-model="settingStore.ignoreCase"
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
              <ElSwitch v-model="settingStore.allowWordTip"
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
              <ElSlider
                  :min="10"
                  :max="100"
                  v-model="settingStore.fontSize.wordForeignFontSize"/>
              <span>{{ settingStore.fontSize.wordForeignFontSize }}</span>
            </div>
          </div>
          <div class="row">
            <label class="sub-title">中文字体</label>
            <div class="wrapper">
              <ElSlider
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
              <ElInputNumber v-model="settingStore.waitTimeForChangeWord"
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
              <label class="item-title">{{ item[0] }}</label>
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
          <div class="row">
            <label class="item-title"></label>
            <div class="wrapper">
              <BaseButton @click="resetShortcutKeyMap">恢复默认</BaseButton>
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 3">
          <div class="row">
            <div class="main-title">数据导出</div>
          </div>
          <div class="row">
            <label class="sub-title">
              目前用户的所有数据(自定义设置、自定义词典、练习进度等)
              <b>仅保存在本地</b>
              。如果您需要在不同的设备、浏览器或者其他非官方部署上使用 {{ APP_NAME }}， 您需要手动进行数据同步和保存。
            </label>
          </div>
          <div class="row mt-2">
            <BaseButton @click="exportData">数据导出</BaseButton>
          </div>
          <div class="row">
            <div class="main-title">数据导入</div>
          </div>
          <div class="row">
            <label class="sub-title">
              请注意，导入数据将
              <b style="color: red"> 完全覆盖 </b>
              当前数据。请谨慎操作。
            </label>
          </div>
          <div class="row">
            <div class="import hvr-grow">
              <BaseButton>数据导入</BaseButton>
              <input type="file"
                     accept="application/json"
                     @change="importData">
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 4" class="feedback-modal">
          <div>
            给我发Email：<a href="mailto:zyronon@163.com">zyronon@163.com</a>
          </div>
          <p>or</p>
          <div class="github">
        <span>在<a :href="GITHUB" target="_blank">Github</a>上给我提一个
        <a :href="`${GITHUB}/issues`" target="_blank">Issue</a>
        </span>
            <div class="options">
              <BaseButton>
                <a :href="`${GITHUB}/issues/new?assignees=&labels=&projects=&template=%E5%8D%95%E8%AF%8D%E9%94%99%E8%AF%AF---word-error.md&title=%E5%8D%95%E8%AF%8D%E9%94%99%E8%AF%AF+%7C+Word+error`"
                   target="_blank">词典错误？</a>
              </BaseButton>
              <BaseButton>
                <a :href="`${GITHUB}/issues/new?assignees=&labels=&projects=&template=问题报告---bug-report-.md&title=问题报告+%7C+Bug+report+`"
                   target="_blank">反馈BUG？</a>
              </BaseButton>
              <BaseButton>
                <a :href="`${GITHUB}/issues/new?assignees=&labels=&projects=&template=功能请求---feature-request.md&title=功能请求+%7C+Feature+request`"
                   target="_blank">功能请求？</a>
              </BaseButton>
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 5" class="center flex-col">
          <h1>Type Words</h1>
          <p class="w-100 text-xl">
            感谢使用本项目！本项目是开源项目，如果觉得有帮助，请在 GitHub 点个 Star，您的支持是我持续改进的动力。
          </p>
          <p>
            GitHub地址：<a href="https://github.com/zyronon/TypeWords" target="_blank">https://github.com/zyronon/TypeWords</a>
          </p>
          <p>
            反馈：<a
              href="https://github.com/zyronon/TypeWords/issues" target="_blank">https://github.com/zyronon/TypeWords/issues</a>
          </p>
          <div class="text-md color-gray">
            Build {{ gitLastCommitHash }}
          </div>

        </div>
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">
.setting {
  display: flex;
  color: var(--color-font-1);

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border-right: 2px solid gainsboro;

    .tabs {
      padding: .6rem 1.6rem;
      display: flex;
      flex-direction: column;
      gap: .6rem;
      //color: #0C8CE9;

      .tab {
        cursor: pointer;
        padding: .6rem .9rem;
        border-radius: .5rem;
        display: flex;
        align-items: center;
        gap: .6rem;

        &.active {
          background: var(--color-select-bg);
          color: var(--color-select-text);
        }
      }
    }

  }

  .content {
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 2.6rem;

    .row {
      min-height: 2.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: calc(var(--space) * 5);

      .wrapper {
        height: 2rem;
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: var(--space);

        span {
          text-align: right;
          //width: 30rem;
          font-size: .7rem;
          color: gray;
        }

        .set-key {
          align-items: center;

          input {
            width: 9rem;
            box-sizing: border-box;
            margin-right: .6rem;
            height: 1.8rem;
            outline: none;
            font-size: 1rem;
            border: 1px solid gray;
            border-radius: .2rem;
            padding: 0 .3rem;
            background: var(--color-second);
            color: var(--color-font-1);
          }
        }
      }

      .main-title {
        font-size: 1.1rem;
        font-weight: bold;
      }

      .item-title {
        font-size: 1rem;
      }

      .sub-title {
        font-size: .9rem;
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
      padding-right: .6rem;
      overflow: auto;
    }

    .desc {
      margin-bottom: .6rem;
      font-size: .8rem;
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

.import {
  display: inline-flex;
  position: relative;

  input {
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
  }
}

.feedback-modal {
  //height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space);
  //justify-content: center;
  color: var(--color-font-1);

  p {
    font-size: 2.4rem;
  }

  .github {
    display: flex;
    align-items: center;
    gap: var(--space);

    .options {
      display: flex;
      flex-direction: column;
      gap: .6rem;
    }
  }
}

.about {
  text-align: center;
}

</style>
