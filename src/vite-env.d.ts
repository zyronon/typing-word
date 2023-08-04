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

declare module '*.ts';