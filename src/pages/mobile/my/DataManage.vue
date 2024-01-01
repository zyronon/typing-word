<script setup lang="ts">

import {APP_NAME, EXPORT_DATA_KEY, SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import BaseButton from "@/components/BaseButton.vue";
import {checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting, shakeCommonDict} from "@/utils";
import {saveAs} from "file-saver";
import {useSettingStore} from "@/stores/setting.ts";
import {useBaseStore} from "@/stores/base.ts";
import NavBar from "@/pages/mobile/components/NavBar.vue";

const settingStore = useSettingStore()
const store = useBaseStore()

function exportData() {
  let data = {
    version: EXPORT_DATA_KEY.version,
    val: {
      setting: {
        version: SAVE_SETTING_KEY.version,
        val: settingStore.$state
      },
      dict: {
        version: SAVE_DICT_KEY.version,
        val: shakeCommonDict(store.$state)
      }
    }
  }
  let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
  let date = new Date()
  let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
  saveAs(blob, `${APP_NAME}-User-Data-${dateStr}.json`);
  ElMessage.success('导出成功！')
}

function importData(e) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader();
  reader.onload = function (v) {
    let str = v.target.result;
    if (str) {
      let obj = JSON.parse(str)
      if (obj.version === EXPORT_DATA_KEY.version) {

      } else {
        //TODO
      }
      let data = obj.val
      let settingState = checkAndUpgradeSaveSetting(data.setting)
      settingStore.setState(settingState)
      let dictState = checkAndUpgradeSaveDict(data.dict)
      store.init(dictState)
      ElMessage.success('导入成功！')
    }
  }
  reader.readAsText(file);
}
</script>

<template>
  <div class="mobile-page">
    <NavBar title="数据管理"/>
    <div class="page-content">
      <div class="row">
        <div class="main-title">数据导出</div>
      </div>
      <div class="row">
        <label class="sub-title">
          目前用户的所有数据(自定义设置、自定义词典、练习进度等)
          <b>仅保存在本地</b>
          。如果您需要在不同的设备、浏览器或者其他非官方部署上使用 {{ APP_NAME }}， 您需要手动进行数据同步和保存。
        </label>
      </div>
      <div class="row">
        <BaseButton @click="exportData">数据导出</BaseButton>
      </div>
      <div class="row">
        <div class="main-title">数据导入</div>
      </div>
      <div class="row">
        <label class="sub-title">
          请注意，导入数据将
          <b style="color: red"> 完全覆盖 </b>
          当前数据。请谨慎操作。
        </label>
      </div>
      <div class="row">
        <div class="import hvr-grow">
          <BaseButton>数据导入</BaseButton>
          <input type="file"
                 accept="application/json"
                 @change="importData">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>