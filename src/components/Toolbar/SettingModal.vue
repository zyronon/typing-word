<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue"
import {useBaseStore} from "@/stores/base.ts"
import {Icon} from '@iconify/vue';
import {watch, ref} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {useChangeAllSound, useWatchAllSound} from "@/hooks/sound.ts";

const tabIndex = $ref(0)
const settingStore = useSettingStore()

interface IProps {
  modelValue: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

const emit = defineEmits([
  'update:modelValue',
])

useWatchAllSound()

</script>

<template>
  <Modal
      :modelValue="props.modelValue"
      @close="emit('update:modelValue',false)"
      title="设置" subTitle="修改立即生效，实时保存">
    <div class="setting-modal">
      <div class="tabs">
        <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
          <Icon icon="bx:headphone" width="20" color="#0C8CE9"/>
          <span>音效设置</span>
        </div>
        <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">
          <Icon icon="icon-park-outline:setting-config" width="20" color="#0C8CE9"/>
          <span>其他设置</span>
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
              <el-slider v-model="settingStore.wordSoundSpeed" :step="0.1" :min="1" :max="4"/>
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
              <el-switch v-model="settingStore.value1"
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
            <label class="item-title">字体设置</label>
          </div>
          <div class="row">
            <label class="sut-title">外语字体</label>
            <div class="wrapper">
              <el-slider
                  :min="10"
                  :max="100"
                  v-model="settingStore.foreignLanguageFontSize"/>
              <span>{{ settingStore.foreignLanguageFontSize }}</span>
            </div>
          </div>
          <div class="row">
            <label class="sut-title">中文字体</label>
            <div class="wrapper">
              <el-slider
                  :min="10"
                  :max="100"
                  v-model="settingStore.translateLanguageFontSize"/>
              <span>{{ settingStore.translateLanguageFontSize }}</span>
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
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.setting-modal {
  width: 40vw;
  height: 80vh;
  display: flex;
  color: var(--color-font-1);

  .tabs {
    padding: 10rem 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
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
        background: whitesmoke;
      }
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

      label {

      }

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