<script setup lang="ts">
import Tooltip from "@/components/Tooltip.vue"
import {
  MenuFold,
  Moon,
  PreviewCloseOne,
  PreviewOpen,
  SettingTwo,
  SunOne,
  VolumeNotice,
  HeadphoneSound,
  SettingConfig,
  Down,
  DatabaseFail
} from "@icon-park/vue-next"
import IconRepeat from '~icons/tabler/repeat'
import useThemeColor from "@/hooks/useThemeColor.ts"
import {useBaseStore} from "@/stores/base.ts"
import {reactive} from "vue"
import Modal from "@/components/Modal/Modal.vue"

const {appearance, toggle} = useThemeColor()
const store = useBaseStore()
const tabIndex = $ref(0)
const setting = reactive({
  showToolbar: true,
  show: false,
  value1: false,
  value2: 50,
  value3: 1,
  value4: false,
})
</script>

<template>
  <header :class="!setting.showToolbar && 'hide'">
    <div class="info"  @click="store.dictModalIsOpen = true">
      CTE-4 第5章
    </div>
    <div class="options">
      <Tooltip title="切换主题">
        <moon v-if="appearance === 'dark'" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"
              @click="toggle"/>
        <sun-one v-else theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2" @click="toggle"/>
      </Tooltip>
      <Tooltip title="设置">
        <setting-two @click="setting.show = true" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <Tooltip title="反馈字典错误">
        <database-fail theme="outline" size="24" fill="#333"/>
      </Tooltip>
      <Tooltip title="音效设置">
        <volume-notice theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <IconRepeat></IconRepeat>
      <Tooltip title="单词本">
        <preview-open theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
        <preview-close-one theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <div class="my-button" @click="store.dictModalIsOpen2 = true">ok</div>
      <Tooltip title="单词本">
        <menu-fold class="menu" @click="store.sideIsOpen = !store.sideIsOpen"
                   theme="outline" size="20" fill="#929596"
                   :strokeWidth="2"/>
      </Tooltip>
    </div>
    <Tooltip :title="setting.showToolbar?'收起':'展开'">
      <down
          @click="setting.showToolbar = !setting.showToolbar"
          class="arrow" theme="outline" size="24" fill="#333"/>
    </Tooltip>
  </header>
  <Modal v-model="setting.show" title="设置" subTitle="修改立即生效，实时保存">
    <div class="setting-modal">
      <div class="tabs">
        <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
          <headphone-sound theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
          <span>音效设置</span>
        </div>
        <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">
          <setting-config theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
          <span>其他设置</span>
        </div>
      </div>
      <div class="content">
        <div v-if="tabIndex === 0">
          <div class="row">
            <label class="main-title">所有音效</label>
            <div class="wrapper">
              <el-switch v-model="setting.value1"
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
              <el-switch v-model="setting.value1"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}%</span>
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="setting.value3" :step="0.1" :max="4"/>
              <span>{{ setting.value3 }}</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">按键音</label>
            <div class="wrapper">
              <el-switch v-model="setting.value1"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}%</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">释义发音</label>
            <div class="wrapper">
              <el-switch v-model="setting.value1"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}%</span>
            </div>
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">效果音（章节结算页烟花音效）</label>
            <div class="wrapper">
              <el-switch v-model="setting.value1"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="row">
            <label class="sub-title">音量</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}%</span>
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 1">
          <div class="row">
            <label class="item-title">章节乱序</label>
            <div class="wrapper">
              <el-switch v-model="setting.value1"
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
              <el-switch v-model="setting.value1"
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
              <el-switch v-model="setting.value1"
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
              <el-switch v-model="setting.value1"
                         inline-prompt
                         active-text="开"
                         inactive-text="关"
              />
            </div>
          </div>
          <div class="desc">
            开启后，可以通过鼠标 hover 单词显示正确答案
          </div>
          <div class="line"></div>
          <div class="row">
            <label class="item-title">字体设置</label>
          </div>
          <div class="row">
            <label class="sut-title">外语字体</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}px</span>
            </div>
          </div>
          <div class="row">
            <label class="sut-title">中文字体</label>
            <div class="wrapper">
              <el-slider v-model="setting.value2"/>
              <span>{{ setting.value2 }}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

header {
  margin-top: 10rem;
  height: 60rem;
  width: 50%;
  background: var(--color-header-bg);
  display: flex;
  justify-content: space-between;
  border-radius: 8rem;
  position: relative;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;
  transition: all .3s;

  .info {
    font-size: 22rem;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .options {
    display: flex;
    align-items: center;
    gap: 10rem;
  }

  &.hide {
    transform: translateY(calc(-100% - 10rem));
  }

  .arrow {
    position: absolute;
    bottom: 0;
    left: 50%;
    cursor: pointer;
    transform: translate3d(-50%, 120%, 0);
  }
}

.setting-modal {
  width: 40vw;
  height: 80vh;
  display: flex;
  color: var(--color-font);

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

      &.active {
        background: whitesmoke;
      }
    }
  }

  .content {
    background: white;
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