import {cloneDeep} from "@/utils"

export {}

declare global {
  interface Console {
    json(v: any): void
  }

  interface Console {
    parse(v: any): void
  }
}
console.json = function (v: any) {
  console.log(cloneDeep(v))
}
console.parse = function (v: any) {
  console.log(JSON.parse(v))
}
