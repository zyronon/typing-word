/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />
// declare module '*.json' {
//   const src: string
//   export default src
// }

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module "*.vue" {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module '*.vue' {
//   import Vue from 'vue'
//   export default Vue
// }

declare module '*.ts';