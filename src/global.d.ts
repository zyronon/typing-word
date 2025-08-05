import {cloneDeep} from "@/utils"

export {}

declare global {
  interface Console {
    parse(v: any): void

    json(v: any, space: number): void
  }
}
console.json = function (v: any, space = 0) {
  const json = JSON.stringify(
    v,
    (key, value) => {
      if (Array.isArray(value)) {
        return `__ARRAY__${JSON.stringify(value)}`;
      }
      return value;
    },
    space
  ).replace(/"__ARRAY__(\[.*?\])"/g, (_, arr) => arr);
  console.log(json);
  return json;
}
console.parse = function (v: any) {
  console.log(JSON.parse(v))
}
