<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseIcon from "@/components/BaseIcon.vue";

const base = useBaseStore()

</script>

<template>
  <div id="BatchAddArticle">
    <div class="slide">
      <header>
        <div class="dict-name">{{ base.dictTitle }}</div>
        <BaseIcon title="选择其他词典/文章" icon="carbon:change-catalog"/>
      </header>
      <div class="article-list">
        <div class="item" v-for="(item,index) in base.currentDict.articles">
          <div class="left">
            <div class="name"> {{ `${index + 1}. ${item.title}` }}</div>
            <div class="translate-name"> {{ `   ${item.titleTranslate}` }}</div>
          </div>
          <div class="right">
            <BaseIcon title="删除" icon="fluent:delete-24-regular"/>
          </div>
        </div>
      </div>
      <div class="footer">
        <BaseButton>导入</BaseButton>
        <BaseButton>导出</BaseButton>
      </div>
    </div>
    <div class="content">
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

#BatchAddArticle {
  width: 100vw;
  height: 100vh;
  display: flex;
  color: black;

  .slide {
    height: 100%;
    background: white;
    padding: 0 10rem;
    display: flex;
    flex-direction: column;

    $height: 60rem;

    header {
      height: $height;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .dict-name {
        font-size: 30rem;
        color: black;
      }
    }

    .article-list {
      flex: 1;
      width: 300rem;
      overflow: auto;

      .item {
        background: #e1e1e1;
        border-radius: 8rem;
        margin-bottom: 10rem;
        padding: 10rem;
        display: flex;
        justify-content: space-between;

        .name {
          font-size: 18rem;
        }

        .translate-name {
          font-size: 16rem;
        }
      }
    }

    .footer {
      height: $height;
      display: flex;
      gap: $space;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .content {
    flex: 1;
  }
}
</style>