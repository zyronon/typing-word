<script setup lang="ts">

import {splitEnArticle} from "@/hooks/article.ts";
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";

let data = {
  "title": "A cold welcome",
  "titleTranslate": "冷遇",
  "text": "On Wednesday evening, we went to the Town Hall. It was the last day of the year and a large crowd of people had gathered under the Town Hall clock. It would strike twelve in twenty minutes' time. Fifteen minutes passed and then, at five to twelve, the clock stopped. The big minute hand did not move. We waited and waited, but nothing happened. Suddenly someone shouted. 'It's two minutes past twelve! The clock has stopped!' I looked at my watch. It was true. The big clock refused to welcome the New Year. At that moment, everybody began to laugh and sing.\n",
  "textCustomTranslate": "星期三的晚上，我们去了市政厅。 那是一年的最后一天，一大群人聚集在市政厅的大钟下面。再过20分钟，大钟将敲响12下。15分钟过去了，而就在11点55分时，大钟停了。那根巨大的分针不动了。 我们等啊等啊，可情况没有变化。突然有人喊道：“已经12点零2分了！那钟已经停了！”我看了一下我的手表，果真如此。那座大钟不愿意迎接新年。此时，大家已经笑了起来，同时唱起了歌。",
  "textNetworkTranslate": "",
  "textCustomTranslateIsFormat": false,
  "useTranslateType": "custom",
  "newWords": [],
  "id": "UydP2M"
}
// data =   {
//   "title": "The best and the worst",
//   "titleTranslate": "最好的和最差的",
//   "text": "Joe Sanders has the most beautiful garden in our town. Nearly everybody enters for 'The Nicest Garden Competition' each year, but Joe wins every time. Bill Frith's garden is larger than Joe's. Bill works harder than Joe and grows more flowers and vegetables, but Joe's garden is more interesting. He has made neat paths and has built a wooden bridge over a pool. I like gardens too, but I do not like hard work. Every year I enter for the garden competition too, and I always win a little prize for the worst garden in the town!",
//   "textCustomTranslate": "乔.桑德斯拥有我们镇上最漂亮的花园。\n几乎每个人都参加每年举办的“最佳花园竞赛”，而每次都是乔获胜。\n比尔.弗里斯的花园比乔的花园大，\n他比乔也更为勤奋，种植的花卉和蔬菜也更多，但乔的花园更富有情趣。\n他修筑了一条条整洁的小路，并在一个池塘上架了一座小木桥。\n我也喜欢花园，但我却不愿意辛勤劳动。\n每年的花园竞赛我也参加，但总因是镇上最劣的花园而获得一个小奖！",
//   "textNetworkTranslate": "",
//   "textCustomTranslateIsFormat": true,
//   "useTranslateType": "custom",
//   "newWords": [],
//   "id": "TdAAqD"
// }
splitEnArticle(data.text)
const settingStore = useSettingStore()
</script>

<template>
  <div class="page">
    test
    <BaseButton @click="settingStore.load = !settingStore.load">test</BaseButton>
  </div>
</template>

<style scoped lang="scss">
.page {
  position: relative;
  z-index: 1;
  font-size: 14rem;
  color: black;
}
</style>