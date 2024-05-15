/// <reference types="vite/client" />
/// <reference types="unplugin-vue-macros/macros-global" />

import {ElMessageBox} from "element-plus";


// declare module '*.json' {
//   const src: string
//   export default src
// }

declare const LATEST_COMMIT_HASH: string

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";

// declare module '*.png' {
//   const src: string;
//   export default src;
// }

declare module "*.vue" {
  import type {DefineComponent} from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module '*.vue' {
//   import Vue from 'vue'
//   export default Vue
// }

// declare module '*.ts';

// declare global {
//   interface Window {
//     ElMessageBox: ElMessageBox,
//   }
// }

declare var ElMessageBox: ElMessageBox;

/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />