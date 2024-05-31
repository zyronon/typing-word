let path = require("path");
let fs = require("fs");

let fileName = '../public/translate/en2zh_CN.json'
let fileNameWords = '../public/translate/en2zh_CN.words.json'
let read = '../public/dicts/en/word/common/'
let save = "./format2/";
let not = []


let str = fs.readFileSync(fileNameWords, "utf8");
let words = JSON.parse(str)

str = fs.readFileSync(fileName, "utf8");
let allWords = JSON.parse(str)


//判断是不是目录
// const dirs = fs.readdirSync(read)
// dirs.forEach(dictName => {
//   formatDict(read, dictName)
// })

// formatDict(read, '2024HongBao_T1.json')
fs.writeFileSync(save + 'not.json', JSON.stringify(not.filter(v => v.list.length), null, 2));

function formatDict(path, name) {
  try {
    let newObj = []
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    let notListCurrent = {
      name,
      list: []
    }
    list.map(a => {
      let rIndex = words.findIndex(v => v === a.word)
      if (rIndex === -1) {
        notListCurrent.list.push(a.word)
        newObj.push(a)
      } else {
        let data = {
          ...a,
          ...allWords[rIndex]
        }
        newObj.push(data)
      }
    })
    not.push(notListCurrent)

    fs.writeFileSync(save + name, JSON.stringify(newObj, null, 2));
    // fs.writeFileSync(save + name.replace('.json', '.min.json'), JSON.stringify(newObj));
    console.log(`当前字典${name},长度：${list.length},没有翻译的：${notListCurrent.list.length}`)
  } catch (e) {
    console.log('err', name, e)
  }
}

