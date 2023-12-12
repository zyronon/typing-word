let path = require("path");
let fs = require("fs");

let fileName = 'CET4_1.json'
let read = './format/'
let save = "./save/";

let minNew = []
let allNew = []

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, fileName)

fs.writeFileSync(save + 'minNew.min.json', JSON.stringify(minNew));
fs.writeFileSync(save + 'allNew.min.json', JSON.stringify(allNew));

function formatDict(path, name) {
  try {
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    list.map(item => {
      if (!minNew.find(v => v.toLowerCase() === item.word.toLowerCase())) {
        minNew.push(item.word)
        allNew.push(item)
      }
    })
    console.log(name, list.length, minNew.length)
  } catch (e) {
    console.log('err', name, e)
  }
}

