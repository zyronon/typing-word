<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {DefaultDisplayStatistics, DictType, getDefaultWord, ShortcutKey, Sort, Word} from "@/types.ts";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener, useWindowClick} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import Options from "@/pages/pc/word/Options.vue";
import Typing from "@/pages/pc/components/Typing.vue";
import Panel from "@/pages/pc/components/Panel.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useWordOptions} from "@/hooks/dict.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import BaseButton from "@/components/BaseButton.vue";

interface IProps {
  data: {
    new: any[],
    review: any[],
    write: any[],
  }
}

const props = withDefaults(defineProps<IProps>(), {
  data: {
    new: [],
    review: [],
    write: [],
  }
})

const emit = defineEmits<{
  'update:words': [val: Word[]],
  sort: [val: Word[]],
  complete: [val: any]
}>()

const typingRef: any = $ref()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const statStore = usePracticeStore()
const settingStore = useSettingStore()

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()

let allWrongWords = []
let current = $ref({
  index: 0,
  words: [],
  wrongWords: [],
})

watch(() => props.data, () => {
  current.words = props.data.new
  current.index = 0
  current.wrongWords = []
  allWrongWords = []

  statStore.step = 0
  statStore.startDate = Date.now()
  statStore.correctRate = -1
  statStore.inputWordNumber = 0
  statStore.wrong = 0
  statStore.total = props.data.review.concat(props.data.new).concat(props.data.write).length
  statStore.newWordNumber = props.data.new.length
  statStore.index = 0
}, {immediate: true, deep: true})

const word = $computed(() => {
  return current.words[current.index] ?? getDefaultWord()
})

const prevWord: Word = $computed(() => {
  return current.words?.[current.index - 1] ?? undefined
})

const nextWord: Word = $computed(() => {
  return current.words?.[current.index + 1] ?? undefined
})

function next(isTyping: boolean = true) {
  if (current.index === current.words.length - 1) {
    if (current.wrongWords.length) {
      console.log('学完了，但还有错词')
      current.words = shuffle(cloneDeep(current.wrongWords))
      current.index = 0
      current.wrongWords = []
    } else {
      console.log('学完了，没错词', statStore.total, statStore.step, current.index)
      isTyping && statStore.inputWordNumber++
      statStore.speed = Date.now() - statStore.startDate

      if (statStore.step === 2) {
        console.log('emit')
        emitter.emit(EventKey.openStatModal, {})
        // emit('complete', {})
      }

      if (statStore.step === 1) {
        settingStore.dictation = true
        current.words = shuffle(props.data.write.concat(props.data.new).concat(props.data.review))
        statStore.step++
        current.index = 0
      }

      if (statStore.step === 0) {
        statStore.step++
        if (props.data.review.length) {
          current.words = shuffle(props.data.review)
          settingStore.dictation = false
          current.index = 0
        } else {
          next()
        }
      }
    }
  } else {
    current.index++
    isTyping && statStore.inputWordNumber++
    // console.log('这个词完了')
  }
}

function wordWrong() {
  if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    store.wrong.words.push(word)
  }
  if (!current.wrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    current.wrongWords.push(word)
  }
  if (!allWrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    allWrongWords.push(word)
    statStore.wrong++
  }
}

function onKeyUp(e: KeyboardEvent) {
  typingRef.hideWord()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('e', e)
  switch (e.key) {
    case 'Backspace':
      typingRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

//TODO 略过忽略的单词上
function prev() {
  if (current.index === 0) {
    ElMessage.warning('已经是第一个了~')
  } else {
    current.index--
  }
}

function skip(e: KeyboardEvent) {
  next(false)
  // e.preventDefault()
}

function show(e: KeyboardEvent) {
  typingRef.showWord()
}

function collect(e: KeyboardEvent) {
  toggleWordCollect(word)
}

function toggleWordSimpleWrapper() {
  if (!isWordSimple(word)) {
    toggleWordSimple(word)
    //延迟一下，不知道为什么不延迟会导致当前条目不自动定位到列表中间
    setTimeout(() => next(false))
  } else {
    toggleWordSimple(word)
  }
}

function play() {
  typingRef.play()
}

useEvents([
  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Previous, prev],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.ToggleSimple, toggleWordSimpleWrapper],
  [ShortcutKey.PlayWordPronunciation, play],
])

const status = $computed(() => {
  let str = '正在'
  switch (statStore.step) {
    case 0:
      str += `学习新单词`
      break
    case 1:
      str += '复习上次学习'
      break
    case 2:
      str += '默写所有单词'
      break
  }
  return str
})
</script>

<template>
  <div class="practice-word">
    <div class="near-word" v-if="settingStore.showNearWord">
      <div class="prev"
           @click="prev"
           v-if="prevWord">
        <Icon class="arrow" icon="bi:arrow-left" width="22"/>
        <Tooltip
            :title="`上一个(${settingStore.shortcutKeyMap[ShortcutKey.Previous]})`"
        >
          <div class="word">{{ prevWord.word }}</div>
        </Tooltip>
      </div>
      <div class="next"
           @click="next(false)"
           v-if="nextWord">
        <Tooltip
            :title="`下一个(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
        >
          <div class="word" :class="settingStore.dictation && 'word-shadow'">{{ nextWord.word }}</div>
        </Tooltip>
        <Icon class="arrow" icon="bi:arrow-right" width="22"/>
      </div>
    </div>
    <Typing
        v-loading="!store.load"
        ref="typingRef"
        :word="word"
        @wrong="wordWrong"
        @complete="next"
    />
    <div class="options-wrapper">
      <Options
          :is-simple="isWordSimple(word)"
          @toggle-simple="toggleWordSimpleWrapper"
          :is-collect="isWordCollect(word)"
          @toggle-collect="toggleWordCollect(word)"
          @skip="next(false)"
      />
    </div>

    <Teleport to="body">
      <div class="word-panel-wrapper">
        <Panel>
          <template v-slot="{active}">
            <div class="panel-page-item"
                 v-loading="!store.load"
            >
              <div class="list-header">
                <div class="flex items-center gap-1">
                  <Icon icon="material-symbols:hourglass-empty-rounded"/>
                  <span class="text-sm"> {{ status }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span> {{ current.index }} / {{ current.words.length }}</span>
                </div>
              </div>
              <WordList
                  v-if="current.words.length"
                  :is-active="active"
                  :static="false"
                  :show-word="!settingStore.dictation"
                  :show-translate="settingStore.translate"
                  :list="current.words"
                  :activeIndex="current.index"
                  @click="(val:any) => current.index = val.index"
              >
                <template v-slot:suffix="{item,index}">
                  <BaseIcon
                      v-if="!isWordCollect(item)"
                      class="collect"
                      @click="toggleWordCollect(item)"
                      title="收藏" icon="ph:star"/>
                  <BaseIcon
                      v-else
                      class="fill"
                      @click="toggleWordCollect(item)"
                      title="取消收藏" icon="ph:star-fill"/>
                  <BaseIcon
                      v-if="!isWordSimple(item)"
                      class="easy"
                      @click="toggleWordSimple(item)"
                      title="标记为简单词"
                      icon="material-symbols:check-circle-outline-rounded"/>
                  <BaseIcon
                      v-else
                      class="fill"
                      @click="toggleWordSimple(item)"
                      title="取消标记简单词"
                      icon="material-symbols:check-circle-rounded"/>
                </template>
              </WordList>
              <Empty v-else/>
            </div>
          </template>
        </Panel>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">


.practice-word {
  height: 100%;
  flex: 1;
  display: flex;
  //display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 1rem;
  color: gray;
  gap: .4rem;
  position: relative;
  width: var(--toolbar-width);

  .near-word {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    & > div {
      width: 45%;
      align-items: center;

      .arrow {
        font-size: .5rem;
      }
    }

    .word {
      font-size: 1.2rem;
      margin-bottom: .2rem;
      font-family: var(--word-font-family);
    }

    .prev {
      cursor: pointer;
      display: flex;
      float: left;
      gap: .8rem;
    }

    .next {
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
      gap: .8rem;
      float: right;
    }
  }

  .options-wrapper {
    position: absolute;
    margin-top: 8rem;
  }
}

.word-panel-wrapper {
  position: fixed;
  left: 0;
  top: .8rem;
  z-index: 1;
  margin-left: var(--panel-margin-left);
  height: calc(100% - 1.5rem);
}

</style>
