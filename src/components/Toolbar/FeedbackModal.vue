<script setup lang="ts">
import Dialog from "@/components/dialog/Dialog.vue"
import BaseButton from "@/components/BaseButton.vue";
import {GITHUB} from "@/config/ENV.ts";

const emit = defineEmits([
  'close',
])

</script>

<template>
  <Dialog
      @close="emit('close')"
      title="反馈">
    <div class="feedback-modal">
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
               target="_blank">字典错误？</a>
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
  </Dialog>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.feedback-modal {
  width: 500rem;
  //height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--color-second-bg);
  align-items: center;
  padding: var(--space);
  //justify-content: center;
  color: var(--color-font-1);

  p {
    font-size: 30rem;
  }

  .github {
    display: flex;
    align-items: center;
    gap: var(--space);

    .options {
      display: flex;
      flex-direction: column;
      gap: 10rem;
    }
  }
}

</style>