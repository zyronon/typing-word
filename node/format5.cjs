let path = require("path");
let fs = require("fs");

let fileName = '2024HongBao_T1.json'
let read = '../public/dicts/code/word/zh-CN/'
let save = "./format2/";

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, fileName)


function formatDict(path, name) {
  try {
    let newObj = []
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    list.map(a => {
      let data = {
        word: a.name,
        trans: a.trans.map(b => {
          return {
            cn: b,
          }
        }),
      }
      newObj.push(data)
    })

    fs.writeFileSync(save + name, JSON.stringify(newObj, null, 2));
    // fs.writeFileSync(save + name.replace('.json', '.min.json'), JSON.stringify(newObj));
    console.log(name, newObj.length)
  } catch (e) {
    console.log('err', name, e)
  }
}

