<script setup>
import Modal from "@/components/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";

const store = useBaseStore()
</script>

<template>
  <Modal v-model="store.dictModalIsOpen2">

  </Modal>
</template>
<style scoped lang="scss">

</style>