let path = require("path");
let fs = require("fs");

let fileName = '2024HongBao_T1.json'
let read = '../public/dicts/en/word/common/'
let save = "./res/";


let minNew = []
let allNew = []
let notContain = []
let str = fs.readFileSync('./save/allNew.min.json', "utf8");
allNew = JSON.parse(str)

let str3 = fs.readFileSync('./save/minNew.min.json', "utf8");
minNew = JSON.parse(str3)

let str1 = fs.readFileSync('../public/translate/en2zh_CN-min.json', "utf8");
let en2zh_CN = JSON.parse(str1)

en2zh_CN.map(v => {
  try {
    let rIndex = minNew.findIndex(a => a.trim().toLowerCase() === v.name.trim().toLowerCase())
    if (rIndex === -1) {

      let data = {
        id: allNew.length,
        word: v.name,
        phonetic0: v.usphone,
        phonetic1: v.ukphone,
        trans: []
      }

      if (v.trans instanceof Array) {
        data.trans = v.trans.map(a => {
          return {
            "pos": "",
            "cn": a,
            en: ''
          }
        })
      }
      if (v.trans instanceof String) {
        data.trans = [{
          "pos": "",
          "cn": v.trans,
          en: ''
        }]
      }

      allNew.push()
      minNew.push(v.name)
      notContain.push(v.name)
    }
  } catch (e) {
    console.log('err', e, v)
  }
})

console.log('不存在的', notContain.length)
fs.writeFileSync(save + 'minNew2.min.json', JSON.stringify(minNew));
fs.writeFileSync(save + 'allNew2.min.json', JSON.stringify(allNew));



