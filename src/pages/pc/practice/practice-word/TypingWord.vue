<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {DefaultDisplayStatistics, DictType, getDefaultWord, ShortcutKey, Sort, Word} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener, useWindowClick} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import Options from "@/pages/pc/practice/Options.vue";
import Typing from "@/pages/pc/practice/practice-word/Typing.vue";
import Panel from "@/pages/pc/practice/Panel.vue";
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
  }
}

const props = withDefaults(defineProps<IProps>(), {
  data: {
    new: [],
    review: [],
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
const statisticsStore = usePracticeStore()
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

let showSortOption = $ref(false)
useWindowClick(() => showSortOption = false)

watch(() => props.data, () => {
  current.words = props.data.new
  current.index = 0
  current.wrongWords = []
  allWrongWords = []

  statisticsStore.step = 0
  statisticsStore.startDate = Date.now()
  statisticsStore.correctRate = -1
  statisticsStore.inputWordNumber = 0
  statisticsStore.wrongWordNumber = 0
  statisticsStore.total = props.data.review.concat(props.data.new).length
  statisticsStore.newWordNumber = props.data.new.length
  statisticsStore.index = 0
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
      console.log('当前背完了，但还有错词')
      current.words = cloneDeep(current.wrongWords)
      current.wrongWords = []
    } else {
      console.log('这章节完了', statisticsStore.total)
      isTyping && statisticsStore.inputWordNumber++
      statisticsStore.speed = Date.now() - statisticsStore.startDate
      if (statisticsStore.step) {
        emitter.emit(EventKey.openStatModal, {})
        // emit('complete', {})
      } else {
        if (props.data.review.length) {
          settingStore.dictation = true
          statisticsStore.step++
          current.words = shuffle(props.data.review.concat(props.data.new))
          current.index = 0
        } else {
          emitter.emit(EventKey.openStatModal, {})
          // emit('complete', {})
        }
      }
    }
  } else {
    current.index++
    isTyping && statisticsStore.inputWordNumber++
    console.log('这个词完了')
  }
}

function wordWrong() {
  if (!store.wrong2.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    store.wrong2.push(word)
  }
  if (!current.wrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    current.wrongWords.push(word)
  }
  if (!allWrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    allWrongWords.push(word)
    statisticsStore.wrongWordNumber++
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

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    emit('sort', reverse(cloneDeep(current.words)))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    emit('sort', shuffle(current.words))
  }
}

onMounted(() => {
  emitter.on(ShortcutKey.ShowWord, show)
  emitter.on(ShortcutKey.Previous, prev)
  emitter.on(ShortcutKey.Next, skip)
  emitter.on(ShortcutKey.ToggleCollect, collect)
  emitter.on(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.on(ShortcutKey.PlayWordPronunciation, play)
})

onUnmounted(() => {
  emitter.off(ShortcutKey.ShowWord, show)
  emitter.off(ShortcutKey.Previous, prev)
  emitter.off(ShortcutKey.Next, skip)
  emitter.off(ShortcutKey.ToggleCollect, collect)
  emitter.off(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.off(ShortcutKey.PlayWordPronunciation, play)
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
                <div>{{ current.words.length }}个单词</div>
                <div style="position:relative;"
                     @click.stop="null">
                  <BaseIcon
                      title="改变顺序"
                      icon="icon-park-outline:sort-two"
                      @click="showSortOption = !showSortOption"
                  />
                  <MiniDialog
                      v-model="showSortOption"
                      style="width: 9rem;"
                  >
                    <div class="mini-row-title">
                      列表循环设置
                    </div>
                    <div class="mini-row">
                      <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                      <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
                    </div>
                  </MiniDialog>
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
@import "@/assets/css/variable";

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