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
let str1 = fs.readFileSync('./save/minNew.min.json', "utf8");
minNew = JSON.parse(str1)

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, fileName)

console.log('notContain', notContain.length)
fs.writeFileSync(save + 'notContain.min.json', JSON.stringify(notContain, null, 2));

// fs.writeFileSync(save + 'allNew.min.json', JSON.stringify(allNew));

function formatDict(path, name) {
  try {
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    let newList = []
    let newNotContain = {
      dictName: name,
      list: []
    }
    list.map((item, i) => {
      let rIndex = minNew.findIndex(v => v.trim().toLowerCase() === item.name.trim().toLowerCase())
      if (rIndex > -1) {
        newList.push({...allNew[rIndex], id: i})
      } else {
        newList.push({
          id: i,
          word: item.name
        })
        newNotContain.list.push(item.name)
      }
    })
    console.log(name, newNotContain.list.length)
    notContain.push(newNotContain)

    fs.writeFileSync(save + name.replace('.json', '.min.json'), JSON.stringify(newList, null, 2));
  } catch (e) {
    console.log('err', name, e)
  }
}

