<script setup lang="ts">

import {reactive, watch} from "vue";
import {Article, Sentence, TranslateEngine} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {getCompleteTranslate, localTranslate, networkTranslate} from "@/hooks/translate.ts";
import * as copy from "copy-to-clipboard";
import {CnKeyboardMap, splitArticle, splitCNArticle} from "@/hooks/article.ts";

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

let article2 = `What is one of the features of modern camping where nationality is concerned?
Economy is one powerful motive for camping, since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.
That the equipment of modern camping becomes yearly more sophisticated is an entertaining paradox for the cynic, a brighter promise for the hopeful traveler who has sworn to get away from it all. It also provides-and some student sociologist might care to base his thesis upon the phenomenon -- an escape of another kind. The modern traveller is often a man who dislikes the Splendide and the Bellavista, not because he cannot afford, or shuns their material comforts. but because he is afford of them. Affluent he may be, but he is by no means sure what to tip the doorman or the chambermaid. Master in his own house, he has little idea of when to say boo to a maitre d'hotel.
From all such fears camping releases him. Granted, a snobbery of camping itself, based upon equipment and techniques, already exists; but it is of a kind that, if he meets it, he can readily understand and deal with. There is no superior 'they' in the shape of managements and hotel hierarchies to darken his holiday days.
To such motives, yet another must be added. The contemporary phenomenon of car worship is to be explained not least by the sense of independence and freedom that ownership entails. To this pleasure camping gives an exquisite refinement.
From one's own front door to home or foreign hills or sands and back again, everything is to hand. Not only are the means of arriving at the holiday paradise entirely within one's own command and keeping, but the means of escape from holiday hel (if the beach proves too crowded, the local weather too inclement) are there, outside -- or, as likely, part of -- the tent.
Idealists have objected to the package tour, that the traveller abroad thereby denies himself the opportunity of getting to know the people of the country visited. Insularity and self-containment, it is argued, go hand in hand. The opinion does not survive experience of a popular Continental camping place. Holiday hotels tend to cater for one nationality of visitors especially, sometimes exclusively. Camping sites, by contrast, are highly cosmopolitan. Granted, a preponderance of Germans is a characteristic that seems common to most Mediterranean sites; but as yet there is no overwhelmingly specialized patronage. Notices forbidding the open-air drying of clothes, or the use of water points for car washing, or those inviting 'our camping friends' to a dance or a boat trip are printed not only in French or Italian or Spanish, but also in English, German and Dutch. At meal times the odour of sauerkraut vies with that of garlic. The Frenchman's breakfast coffee competes with the Englishman's bacon and eggs.
Whether the remarkable growth of organized camping means the eventual death of the more independent kind is hard to say. Municipalities naturally want to secure the campers' site fees and other custom. Police are wary of itinerants who cannot be traced to a recognized camp boundary or to four walls. But most probably it will all depend upon campers themselves: how many heath fires they cause; how much litter they leave; in short, whether or not they wholly alienate landowners and those who live in the countryside. Only good scouting is likely to preserve the freedoms so dear to the heart of the eternal Boy Scout.
NIGEL BUXTON The Great Escape from The Weekend Telegraph`

// article2 = `Economy is one powerful motive for camping? since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.`

let article = reactive<Article>({
  title: 'A private conversation!',
  titleTranslate: '',
  article: article1,
  customTranslate: ``,
  networkTranslate: '第一周我去了剧院。我坐得很好。这出戏很有趣。我不喜欢它。一个年轻男子和一个年轻女子坐在我身后。他们大声说话。我很生气。我听不见演员们的声音。我转过身来。我愤怒地看着那个男人和那个女人。他们没有理会。最后我无法忍受。我又转过身来。“我一个字也听不见！”我生气地说。\n' +
      '“这不关你的事，”那个年轻人粗鲁地说。“这是私人谈话！”',
  newWords: [],
  articleAllWords: [],
  sections: [],
  sections2: [[{
    "text": "Last week I went to the theatre. ", "translate": "上周我去了剧院。", "words": [{"name": "Last", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "week", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "went", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "to", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "theatre", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]
  }, {"text": "I had a very good seat. ", "translate": "我坐得很好。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "had", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "a", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "very", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "good", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "seat", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "The play was very interesting. ", "translate": "这出戏很有趣。", "words": [{"name": "The", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "play", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "was", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "very", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "interesting", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I did not enjoy it. ", "translate": "我不喜欢它。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "did", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "not", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "enjoy", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "it", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {
    "text": "A young man and a young woman were sitting behind me. ", "translate": "一个年轻男子和一个年轻女子坐在我身后。", "words": [{"name": "A", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "young", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "man", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "and", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "a", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "young", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "woman", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "were", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "sitting", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "behind", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "me", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]
  }, {"text": "They were talking loudly. ", "translate": "他们大声说话。", "words": [{"name": "They", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "were", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "talking", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "loudly", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I got very angry. ", "translate": "我很生气。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "got", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "very", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "angry", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I could not hear the actors. ", "translate": "我听不见演员们的声音。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "could", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "not", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "hear", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "actors", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I turned round. ", "translate": "我转过身来。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "turned", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "round", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {
    "text": "I looked at the man and the woman angrily. ", "translate": "我愤怒地看着那个男人和那个女人。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "looked", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "at", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "man", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "and", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "woman", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "angrily", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]
  }, {"text": "They did not pay any attention. ", "translate": "他们没有理会。", "words": [{"name": "They", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "did", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "not", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "pay", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "any", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "attention", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "In the end, ", "translate": "最后", "words": [{"name": "In", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "end", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ",", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I could not bear it. ", "translate": "我无法忍受。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "could", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "not", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "bear", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "it", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {"text": "I turned round again. ", "translate": "我又转过身来。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "turned", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "round", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "again", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {
    "text": "\"I can't hear a word!\" ", "translate": "“我一个字也听不见！”", "words": [{"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": "start"}, {"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "can't", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "hear", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "a", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "word", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": "!", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": ""}, {"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": "end"}]
  }, {"text": "I said angrily. ", "translate": "我生气地说。", "words": [{"name": "I", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "said", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "angrily", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}], [{
    "text": "\"It's none of your business,\" ", "translate": "“这不关你的事，”", "words": [{"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": "start"}, {"name": "It's", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "none", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "of", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "your", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "business", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ",", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": ""}, {"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": "end"}]
  }, {"text": "the young man said rudely. ", "translate": "那个年轻人粗鲁地说。", "words": [{"name": "the", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "young", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "man", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "said", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "rudely", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": ".", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": ""}]}, {
    "text": "\"This is a private conversation!\" ", "translate": "“这是私人谈话！”", "words": [{"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": "start"}, {"name": "This", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "is", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "a", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "private", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": false, "symbolPosition": ""}, {"name": "conversation", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": false, "symbolPosition": ""}, {"name": "!", "usphone": "", "ukphone": "", "trans": [], "nextSpace": false, "isSymbol": true, "symbolPosition": ""}, {"name": "\"", "usphone": "", "ukphone": "", "trans": [], "nextSpace": true, "isSymbol": true, "symbolPosition": "end"}]
  }]],
  isTranslated: false,
})

let translateType = $ref(0)
let networkTranslateEngine = $ref('baidu')
let progress = $ref(0)
let editTranslateStr = $ref('')
const TranslateEngineOptions = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]

async function startTranslate() {
  if (!article.sections.length) {
    article.sections = splitArticle(article.article)
    article.sections.map((v: Sentence[]) => {
      v.map((w: Sentence) => {
        w.edit = false
      })
    })
  }

  article.networkTranslate = ''
  await networkTranslate(article, TranslateEngine.Baidu, true, (v: number) => {
    progress = v
  })

  copy(JSON.stringify(article.sections))
}

function editTranslate(sentence: Sentence) {
  article.sections.map((v: Sentence[]) => {
    v.map((w: Sentence) => {
      w.edit = false
    })
  })
  sentence.edit = true
  editTranslateStr = sentence.translate
}

function save(sentence: Sentence) {
  sentence.translate = editTranslateStr
  sentence.edit = false

  if (translateType) {
    article.customTranslate = getCompleteTranslate(article)
  } else {
    article.networkTranslate = getCompleteTranslate(article)
  }
}

function changeArticleTranslate(e: string) {
  console.log('e', e)
  localTranslate(article, e)
}

function changeArticle() {
  if (!article.article.trim()) return
  article.sections = splitArticle(article.article)
  article.sections.map((v: Sentence[]) => {
    v.map((w: Sentence) => {
      w.edit = false
    })
  })
  if (translateType) {
    localTranslate(article, article.customTranslate)
  } else {
    localTranslate(article, article.networkTranslate)
  }
}
</script>

<template>
  <div class="add-article">
    <div class="content">
      <div class="row">
        <div class="title">原文</div>
        <div class="item">
          <div class="label">标题：</div>
          <el-input
              v-model="article.title"
              :rows="2"
              type="textarea"
              placeholder="请填写原文标题"
              input-style="color:black;font-size:18rem;"
          />
        </div>
        <div class="item">
          <div class="label">正文：</div>
          <el-input
              v-model="article.article"
              @input="changeArticle"
              :rows="23"
              type="textarea"
              placeholder="请填写原文正文"
              input-style="color:black;font-size:18rem;"
          />
        </div>
      </div>
      <div class="row">
        <div class="title">译文</div>
        <div class="item">
          <div class="label">翻译类型：</div>
          <el-radio-group v-model="translateType">
            <el-radio-button :label="1">本地翻译</el-radio-button>
            <el-radio-button :label="0">网络翻译</el-radio-button>
          </el-radio-group>
        </div>
        <div class="translate" v-if="!translateType">
          <BaseButton @click="startTranslate" :disabled="!article.article.trim()">开始翻译</BaseButton>
          <el-select v-model="networkTranslateEngine"
                     style="width: 80rem;"
          >
            <el-option
                v-for="item in TranslateEngineOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <el-progress :percentage="progress"
                       :duration="30"
                       :striped="progress !== 100"
                       :striped-flow="progress !== 100"
                       :stroke-width="8"
                       :show-text="true"/>
        </div>
        <div class="item">
          <div class="label">标题：</div>
          <el-input
              v-model="article.titleTranslate"
              :rows="2"
              type="textarea"
              placeholder="请填写翻译标题"
              input-style="color:black;font-size:16rem;"
          />
        </div>
        <div class="item">
          <div class="label">正文：</div>
          <el-input
              v-if="translateType"
              v-model="article.customTranslate"
              @input="changeArticleTranslate"
              :rows="20"
              type="textarea"
              placeholder="请填定翻译正文"
              input-style="color:black;font-size:16rem;"
          />
          <el-input
              v-else
              v-model="article.networkTranslate"
              @input="changeArticleTranslate"
              :rows="20"
              type="textarea"
              placeholder="请填定翻译正文"
              input-style="color:black;font-size:16rem;"
          />
        </div>
      </div>
      <div class="row">
        <div class="title">译文对照</div>
        <div class="article-translate">
          <div class="section" v-for="(item,indexI) in article.sections">
            <div class="sentence" v-for="(sentence,indexJ) in item">
              <div class="text">{{ sentence.text }}</div>
              <div class="edit-translate" v-if="sentence.edit">
                <el-input
                    v-model="editTranslateStr"
                    autosize
                    type="textarea"
                    input-style="color:black;"
                />
                <div class="options">
                  <BaseButton @click="sentence.edit = false">取消</BaseButton>
                  <BaseButton @click="save(sentence)">保存</BaseButton>
                </div>
              </div>
              <div class="text-translate" v-else @click="editTranslate(sentence)">
                {{ sentence.translate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.add-article {
  width: 100vw;
  height: 100vh;
  padding: $space;
  box-sizing: border-box;
  color: black;

  .content {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $space * 2;
  }

  .row {
    width: 33%;
    height: 100%;
    display: flex;
    flex-direction: column;
    //opacity: 0;

    &:last-child {
      opacity: 1;
    }

    .title {
      font-size: 22rem;
      text-align: center;
    }

    .item {
      margin-bottom: 10rem;

      .label {
        margin-bottom: 10rem;
      }
    }

    .translate {
      display: flex;
      align-items: center;
      gap: $space;
      margin-bottom: 10rem;

      .el-progress {
        flex: 1;
      }
    }

    .article-translate {
      margin-top: 10rem;
      flex: 1;
      overflow: auto;

      .section {
        background: white;
        margin-bottom: 20rem;
        padding: $space;

        .sentence {
          margin-bottom: 20rem;

          .text {
            font-size: 18rem;
          }

          .text-translate {
            font-size: 16rem;
            min-height: 18rem;
          }

          .edit-translate {
            margin-top: 10rem;
            color: black;

            .options {
              margin-top: 10rem;
              gap: 10rem;
              display: flex;
              justify-content: flex-end;
            }
          }
        }
      }
    }
  }

}
</style>