<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import {computed, nextTick, onMounted, reactive, watch, watchEffect} from "vue"
import {cloneDeep} from "lodash-es"
import 快速打字的机械键盘声音Mp3 from '../..//assets/sound/key-sounds/快速打字的机械键盘声音.mp3'
import 键盘快速打字的声音Mp3 from '../..//assets/sound/key-sounds/键盘快速打字的声音.mp3'
import 电话打字的声音Mp3 from '../..//assets/sound/key-sounds/电话打字的声音.mp3'
import 老式机械 from '../..//assets/sound/key-sounds/老式机械.mp3'
import 机械0 from '../..//assets/sound/key-sounds/jixie/机械0.mp3'
import 机械1 from '../..//assets/sound/key-sounds/jixie/机械1.mp3'
import 机械2 from '../..//assets/sound/key-sounds/jixie/机械2.mp3'
import 机械3 from '../..//assets/sound/key-sounds/jixie/机械3.mp3'
import beep from '../..//assets/sound/beep.wav'
import correct from '../..//assets/sound/correct.wav'
import {useSound} from "@/hooks/useSound.ts"
import {$computed, $ref} from "vue/macros";
import {
  Article,
  ArticleWord,
  DefaultWord,
  DictType,
  SaveKey,
  Sentence,
  ShortKeyMap,
  TranslateEngine,
  Word
} from "@/types";
import {useBaseStore} from "@/stores/base";
import {usePracticeStore} from "@/components/Practice/usePracticeStore.ts";
import {useEventListener} from "@/hooks/useEvent.ts";
import TypeWord from "@/components/Practice/TypeWord.vue";
import {updateLocalSentenceTranslate, getNetworkTranslate} from "@/hooks/translate.ts";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import MiniModal from "@/components/MiniModal.vue";
import {splitArticle} from "@/hooks/article.ts";

let article1 = `How does the older investor differ in his approach to investment from the younger investor?
There is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?
Well, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.
So what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.
For instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.
If you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.
*'Periwigs' is the name of a fictitious company.
INVESTOR'S CHRONICLE, March 23 1990`

article1 = `How does the older investor differ in his approach to investment from the younger investor?`
article1 = `Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. ‘I can't hear a word!’ I said angrily.
‘It's none of your business, ’ the young man said rudely. ‘This is a private conversation!’`
// article1 = `Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it.`

const [playAudio] = usePlayWordAudio()
// const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
const [playKeySound, setAudio] = useSound([老式机械], 3)
// const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)

const store = useBaseStore()
const practiceStore = usePracticeStore()

let isPlay = $ref(false)
let articleWrapperRef = $ref<HTMLInputElement>(null)
let tabIndex = $ref(0)
let sectionIndex = $ref(0)
let sentenceIndex = $ref(0)
let wordIndex = $ref(0)
let stringIndex = $ref(0)
let input = $ref('')
let wrong = $ref('')
let isSpace = $ref(false)
let hoverIndex = $ref({
  sectionIndex: -1,
  sentenceIndex: -1,
})

let wordData = $ref({
  words: [],
  index: -1
})

interface IProps {
  article: Article,
  sectionIndex: number,
  sentenceIndex: number,
  wordIndex: number,
  stringIndex: number,
}

const props = withDefaults(defineProps<IProps>(), {
  article: {
    "title": "A private conversation!",
    "titleTranslate": "私人谈话！",
    "article": "Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. ‘I can't hear a word!’ I said angrily.\n‘It's none of your business, ’ the young man said rudely. ‘This is a private conversation!’",
    "customTranslate": "",
    "networkTranslate": "上周我去了剧院。\n我坐得很好。\n这出戏很有趣。\n我不喜欢它。\n一个年轻男子和一个年轻女子坐在我身后。\n他们大声说话。\n我很生气。\n我听不见演员们的声音。\n我转过身来。\n我愤怒地看着那个男人和那个女人。\n他们没有理会。\n最后\n我无法忍受。\n我又转过身来。\n“我一个字也听不见！”\n我生气地说。\n\n“这不关你的事，”\n那个年轻人粗鲁地说。\n“这是私人谈话！”\n\n",
    "isTranslated": false,
    "newWords": [],
    "articleAllWords": [],
    "sections": [[{
      "text": "Last week I went to the theatre. ",
      "translate": "上周我去了剧院。",
      "words": [{
        "name": "Last",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "week",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "went",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "to",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "theatre",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I had a very good seat. ",
      "translate": "我坐得很好。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "had",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "a",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "very",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "good",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "seat",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "The play was very interesting. ",
      "translate": "这出戏很有趣。",
      "words": [{
        "name": "The",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "play",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "was",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "very",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "interesting",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I did not enjoy it. ",
      "translate": "我不喜欢它。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "did",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "not",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "enjoy",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "it",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "A young man and a young woman were sitting behind me. ",
      "translate": "一个年轻男子和一个年轻女子坐在我身后。",
      "words": [{
        "name": "A",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "young",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "man",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "and",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "a",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "young",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "woman",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "were",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "sitting",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "behind",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "me",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "They were talking loudly. ",
      "translate": "他们大声说话。",
      "words": [{
        "name": "They",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "were",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "talking",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "loudly",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I got very angry. ",
      "translate": "我很生气。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "got",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "very",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "angry",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I could not hear the actors. ",
      "translate": "我听不见演员们的声音。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "could",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "not",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "hear",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "actors",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I turned round. ",
      "translate": "我转过身来。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "turned",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "round",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I looked at the man and the woman angrily. ",
      "translate": "我愤怒地看着那个男人和那个女人。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "looked",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "at",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "man",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "and",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "woman",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "angrily",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "They did not pay any attention. ",
      "translate": "他们没有理会。",
      "words": [{
        "name": "They",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "did",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "not",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "pay",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "any",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "attention",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "In the end, ",
      "translate": "最后",
      "words": [{
        "name": "In",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "end",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ",",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I could not bear it. ",
      "translate": "我无法忍受。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "could",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "not",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "bear",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "it",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "I turned round again. ",
      "translate": "我又转过身来。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "turned",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "round",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "again",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "\"I can't hear a word!\" ",
      "translate": "“我一个字也听不见！”",
      "words": [{
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": "start"
      }, {
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "can't",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "hear",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "a",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "word",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "!",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": ""
      }, {
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": "end"
      }]
    }, {
      "text": "I said angrily. ",
      "translate": "我生气地说。",
      "words": [{
        "name": "I",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "said",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "angrily",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }], [{
      "text": "\"It's none of your business,\" ",
      "translate": "“这不关你的事，”",
      "words": [{
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": "start"
      }, {
        "name": "It's",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "none",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "of",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "your",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "business",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ",",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": ""
      }, {
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": "end"
      }]
    }, {
      "text": "the young man said rudely. ",
      "translate": "那个年轻人粗鲁地说。",
      "words": [{
        "name": "the",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "young",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "man",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "said",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "rudely",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": ".",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": ""
      }]
    }, {
      "text": "\"This is a private conversation!\" ",
      "translate": "“这是私人谈话！”",
      "words": [{
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": "start"
      }, {
        "name": "This",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "is",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "a",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "private",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "conversation",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": false,
        "symbolPosition": ""
      }, {
        "name": "!",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": false,
        "isSymbol": true,
        "symbolPosition": ""
      }, {
        "name": "\"",
        "usphone": "",
        "ukphone": "",
        "trans": [],
        "nextSpace": true,
        "isSymbol": true,
        "symbolPosition": "end"
      }]
    }]
    ],
    "translateType": 0
  },
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})

watchEffect(() => {
  sectionIndex = props.sectionIndex
  sentenceIndex = props.sentenceIndex
  wordIndex = props.wordIndex
  stringIndex = props.stringIndex

  practiceStore.inputNumber = 0
  practiceStore.wrongNumber = 0
  practiceStore.repeatNumber = 0
  practiceStore.total = 0
  props.article.sections.map((v, i) => {
    v.map((w, j) => {
      w.words.map(s => {
        if (!store.skipWordNamesWithSimpleWords.includes(s.name.toLowerCase()) && !s.isSymbol) {
          practiceStore.total++
        }
      })
    })
  })
  practiceStore.wrongWords = []
  practiceStore.startDate = Date.now()
  calcTranslateLocation()
})

function calcTranslateLocation() {
  nextTick(() => {
    setTimeout(() => {
      let articleRect = articleWrapperRef.getBoundingClientRect()
      props.article.sections.map((v, i) => {
        v.map((w, j) => {
          let location = i + '-' + j
          let wordClassName = `.word${location}`
          let word = document.querySelector(wordClassName)
          let wordRect = word.getBoundingClientRect()
          let translateClassName = `.translate${location}`
          let translate: HTMLDivElement = document.querySelector(translateClassName)

          translate.style.opacity = '1'
          translate.style.top = wordRect.top - articleRect.top - 22 + 'px'
          // @ts-ignore
          translate.firstChild.style.width = wordRect.left - articleRect.left + 'px'
          // console.log(word, wordRect.left - articleRect.left)
          // console.log('word-wordRect', wordRect)
        })
      })
    }, 300)
  })
}

function play() {
  return playAudio(article1)
  if (isPlay) {
    isPlay = false
    return window.speechSynthesis.pause();
  }
  let msg = new SpeechSynthesisUtterance();
  msg.text = article1
  msg.rate = 0.5;
  msg.pitch = 1;
  msg.lang = 'en-US';
  // msg.lang = 'zh-HK';
  isPlay = true
  window.speechSynthesis.speak(msg);
}

const currentIndex = computed(() => {
  return `${sectionIndex}${sentenceIndex}${wordIndex}`
})

function onKeyDown(e: KeyboardEvent) {
  if (tabIndex !== 0) return
  // console.log('keyDown', e.key, e.code, e.keyCode)
  wrong = ''
  let currentSection = props.article.sections[sectionIndex]
  let currentSentence = currentSection[sentenceIndex]
  let currentWord: ArticleWord = currentSentence.words[wordIndex]

  const nextWord = () => {
    isSpace = false
    stringIndex = 0
    wordIndex++

    if (!store.skipWordNamesWithSimpleWords.includes(currentWord.name.toLowerCase()) && !currentWord.isSymbol) {
      practiceStore.inputNumber++
    }

    if (!currentSentence.words[wordIndex]) {
      wordIndex = 0
      sentenceIndex++
      if (!currentSection[sentenceIndex]) {
        sentenceIndex = 0
        sectionIndex++
      } else {
        if (store.setting.dictation) {
          calcTranslateLocation()
        }
        playAudio(currentSection[sentenceIndex].text)
      }
    }
  }
  //非英文模式下，输入区域的 keyCode 均为 229时，
  if ((e.keyCode >= 65 && e.keyCode <= 90)
      || (e.keyCode >= 48 && e.keyCode <= 57)
      || e.code === 'Space'
      || e.code === 'Slash'
      || e.code === 'Quote'
      || e.code === 'Comma'
      || e.code === 'BracketLeft'
      || e.code === 'BracketRight'
      || e.code === 'Period'
      || e.code === 'Minus'
      || e.code === 'Equal'
      || e.code === 'Semicolon'
      || e.code === 'Backquote'
      || e.keyCode === 229
  ) {
    if (isSpace) {
      if (e.code === 'Space') {
        nextWord()
      } else {
        wrong = ' '
        playBeep()

        setTimeout(() => {
          wrong = ''
          wrong = input = ''
        }, 500)
      }
      playKeySound()
    } else {
      let letter = e.key

      let key = currentWord.name[stringIndex]
      console.log('key', key,)

      let isWrong = false
      if (store.setting.ignoreCase) {
        isWrong = key.toLowerCase() === letter.toLowerCase()
      } else {
        isWrong = key === letter
      }
      if (isWrong) {
        input += letter
        wrong = ''
        // console.log('匹配上了')
        stringIndex++
        //如果当前词没有index，说明这个词完了，下一个是空格
        if (!currentWord.name[stringIndex]) {
          input = wrong = ''
          if (!currentWord.isSymbol) {
            playCorrect()
          }
          if (currentWord.nextSpace) {
            isSpace = true
          } else {
            nextWord()
          }
        }
      } else {
        if (!store.wrongWordDict.originWords.find((v: Word) => v.name.toLowerCase() === currentWord.name.toLowerCase())) {
          store.wrongWordDict.originWords.push(currentWord)
          store.wrongWordDict.words.push(currentWord)
          store.wrongWordDict.chapterWords = [store.wrongWordDict.words]
        }

        if (!store.skipWordNamesWithSimpleWords.includes(currentWord.name.toLowerCase())) {
          if (!practiceStore.wrongWords.find((v) => v.name.toLowerCase() === currentWord.name.toLowerCase())) {
            practiceStore.wrongWords.push(currentWord)
            practiceStore.wrongNumber++
          }
        }

        wrong = letter
        playBeep()
        setTimeout(() => {
          wrong = ''
        }, 500)
        // console.log('未匹配')
      }
      playKeySound()
    }
  } else {
    switch (e.key) {
      case 'Backspace':
        if (wrong) {
          wrong = ''
        } else {
          input = input.slice(0, -1)
        }
        break
      case ShortKeyMap.Collect:

        break
      case ShortKeyMap.Remove:

        break
      case ShortKeyMap.Ignore:

        break
      case ShortKeyMap.Show:
        if (store.setting.allowWordTip) {
          hoverIndex = {
            sectionIndex: sectionIndex,
            sentenceIndex: sentenceIndex,
          }
        }
        break
    }
  }

  // console.log(
  //     'sectionIndex', sectionIndex,
  //     'sentenceIndex', sentenceIndex,
  //     'wordIndex', wordIndex,
  //     'stringIndex', stringIndex,
  // )
  e.preventDefault()
}

function onKeyUp() {
  hoverIndex = {
    sectionIndex: -1,
    sentenceIndex: -1,
  }
}

// useEventListener('keydown', onKeyDown)
// useEventListener('keyup', onKeyUp)

function playWord(word: ArticleWord) {
  playAudio(word.name)
}

function currentWordInput(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length, input.length + wrong.length + 1)
  if (word.isSymbol) {
    return str
  }
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (store.setting.dictation) {
    return '_'
  }
  return str
}

function currentWordEnd(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length + (wrong ? 0 : 1))
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (store.setting.dictation) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

function otherWord(word: ArticleWord, i: number, i2: number, i3: number) {
  let str = word.name
  if (word.isSymbol) {
    return str
  }

  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  //剩100是因为，可能存在特殊情况，比如003,010这种，0 12 24，100
  if (sectionIndex * 10000 + sentenceIndex * 100 + wordIndex < i * 10000 + i2 * 100 + i3
      && store.setting.dictation
  ) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

</script>

<template>
  <div class="type-wrapper">
    <div class="swiper-wrapper content">
      <div class="swiper-list" :class="`step${tabIndex}`">
        <div class="swiper-item">
          <div class="article-wrapper">
            <header>
              <div class="title">A private conversation!</div>
            </header>
            <div class="article-content" ref="articleWrapperRef">
              <article>
                <div class="section"
                     v-for="(section,indexI) in props.article.sections">
                <span class="sentence"
                      :class="[
                          sectionIndex === indexI && sentenceIndex === indexJ && store.setting.dictation
                          ?'dictation':''
                      ]"
                      @mouseenter="store.setting.allowWordTip && (hoverIndex = {sectionIndex : indexI,sentenceIndex :indexJ})"
                      @mouseleave="hoverIndex = {sectionIndex : -1,sentenceIndex :-1}"
                      @click="playAudio(sentence.text)"
                      v-for="(sentence,indexJ) in section">
                  <span
                      v-for="(word,indexW) in sentence.words"
                      class="word"
                      :class="[(sectionIndex>indexI
                        ?'wrote':
                        (sectionIndex>=indexI &&sentenceIndex>indexJ)
                        ?'wrote' :
                        (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>indexW)
                        ?'wrote':
                         (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>=indexW && stringIndex>=word.name.length)
                        ?'wrote':
                        ''),
                        (`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace && wrong )?'word-wrong':'',
                        indexW === 0 && `word${indexI}-${indexJ}`
                        ]"
                      @click="playWord(word)">
                    <span v-if="`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace">
                      <span class="input" v-if="input">{{ input }}</span>
                      <span class="wrong" :class="wrong === ' ' && 'bg-wrong'" v-if="wrong">{{ wrong }}</span>
                      <span class="bottom-border" v-else>{{ currentWordInput(word, indexI, indexJ) }}</span>
                      <span>{{ currentWordEnd(word, indexI, indexJ,) }}</span>
                    </span>
                    <span v-else>{{ otherWord(word, indexI, indexJ, indexW) }}</span>
                    <span
                        v-if="word.nextSpace"
                        :class="[
                            `${indexI}${indexJ}${indexW}`,
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && wrong) && 'bg-wrong',
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong) && 'bottom-border',
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong && store.setting.dictation) && 'word-space',
                        ]">
                      {{
                        (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && store.setting.dictation) ? '_' : ' '
                      }}
                    </span>
                  </span>
                </span>
                </div>
              </article>
              <div class="translate" v-show="store.setting.translate">
                <template v-for="(v,i) in props.article.sections">
                  <div class="row"
                       :class="`translate${i+'-'+j}`"
                       v-for="(item,j) in v">
                    <span class="space"></span>
                    <Transition name="fade">
                      <span class="text" v-if="item.translate">{{ item.translate }}</span>
                    </Transition>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-item">
          <TypeWord
              :words="wordData.words"
              :index="wordData.index"
              v-if="tabIndex === 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.wrote {
  //color: green;
  color: rgb(22, 163, 74);
}

.type-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  .content {
    width: 1000px;
  }

  .article-wrapper {

    header {
      .title {
        text-align: center;
        color: rgba(gray, .8);
        font-size: 36rem;
        font-weight: 500;
        word-spacing: 3rem;
        opacity: 0;
      }
    }

    .article-content {
      position: relative;
      //opacity: 0;
    }

    article {
      //height: 100%;
      font-size: 24rem;
      line-height: 2.5;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      color: gray;
      word-break: keep-all;
      word-wrap: break-word;
      white-space: pre-wrap;
      padding-top: 20rem;

      .section {
        margin-bottom: $space;

        .sentence {
          transition: all .3s;

          &.dictation {
            letter-spacing: 3rem;
          }
        }

        .word {
          display: inline-block;
        }
      }
    }

    .translate {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      font-size: 18rem;
      color: gray;
      line-height: 3.5;
      letter-spacing: 3rem;
      //display: none;

      .row {
        position: absolute;
        left: 0;
        width: 100%;
        opacity: 0;

        .space {
          transition: all .3s;
          display: inline-block;
        }
      }
    }
  }

  .word-space {
    position: relative;
    color: gray;

    &::after {
      content: ' ';
      position: absolute;
      width: 1.5rem;
      height: 4rem;
      background: gray;
      bottom: 2rem;
      right: 2.5rem;
    }

    &::before {
      content: ' ';
      position: absolute;
      width: 1.5rem;
      height: 4rem;
      background: gray;
      bottom: 2rem;
      left: 0;
    }
  }

  .bottom-border {
    animation: underline 1s infinite steps(1, start);
  }

  .input {
    font-weight: bold;
    color: var(--color-main-active);
  }

  .wrong {
    color: rgba(red, 0.6);
  }

  .word-wrong {
    display: inline-block;
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  .bg-wrong {
    display: inline-block;
    color: gray;
    background: rgba(red, 0.6);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

.swiper-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .swiper-list {
    transition: transform .3s;
    height: 200%;

    .swiper-item {
      height: 50%;
      overflow: auto;
      display: flex;
    }
  }

  .step1 {
    transform: translate3d(0, -50%, 0);
  }
}

@keyframes underline {
  0%, 100% {
    border-left: 1.3rem solid black;
  }
  50% {
    border-left: 1.3rem solid transparent;
  }
}
</style>