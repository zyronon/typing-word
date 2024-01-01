<script setup lang="ts">

import NavBar from "@/pages/mobile/components/NavBar.vue";
import {APP_NAME} from "../../../utils/const.ts";
</script>

<template>
  <div class="mobile-page">
    <NavBar title="关于我们"/>
    <div class="page-content">
      <div class="name">{{ APP_NAME }}</div>
      <div class="desc">可在网页上使用的背单词软件</div>
      <div class="git">
        Github地址： <a target="_blank" href="https://github.com/zyronon/typing-word">https://github.com/zyronon/typing-word</a>
      </div>
      <div class="features">功能列表</div>
      <ul>
        <li>
          <div class="title">背单词</div>
          <div class="txt">可以选择记忆或默写单词，提供了音标显示、发音功能（均可选美音、英音）、错误统计</div>
        </li>
        <li>
          <div class="title">背文章</div>
          <div class="txt">
            内置经典教材书籍，可以练习和背诵文章，逐句输入，自动发音。也可以自行添加、导入文章，提供一键翻译、译文对照功能
          </div>
        </li>
        <li>
          <div class="title">生词本、错词本、简单词</div>
          <div class="txt">
            默写单词时输入错误会自动添加到错词本，以便后续复习。也可以添加到简单词，之后再遇到这个词便会自动跳过，同时也可以将其添加到生词本中，以便巩固复习
          </div>
        </li>
        <li>
          <div class="title">默写模式</div>
          <div class="txt">
            在用户完成一个章节的练习后，如果有错误词，那么会重复练习错误词，直到没有错误词为止。完成之后弹出选项可选择默写本章、重复本章、下一章
          </div>
        </li>
        <li>
          <div class="title">词库</div>
          <div class="txt">内置了常用的 CET-4 、CET-6 、GMAT 、GRE 、IELTS 、SAT 、TOEFL
            、考研英语、专业四级英语、专业八级英语，也有程序员常见英语单词以及多种编程语言
            API 等词库。 尽可能满足大部分用户对背单词的需求，也非常欢迎社区贡献更多的词库。
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile-page {
  .name {
    padding: 30rem 0;
    font-size: 46rem;
    text-align: center;
    border-bottom: 1px solid #c9c9c9;
    margin-bottom: 20rem;
  }

  .desc {
    font-size: 22rem;
  }

  .features {
    margin-top: 20rem;
    font-weight: bold;
    font-size: 22rem;
  }

  li {
    margin: 10rem 0;

    .title {
      font-weight: bold;
    }
  }
}

</style>