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
        </span>
        <div class="options">
          <BaseButton>
            <a :href="`${GITHUB}/issues/new`"
               target="_blank">Issue</a>
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
