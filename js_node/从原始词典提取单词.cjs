let path = require("path");
let fs = require("fs");

//词典来自：https://github.com/kajweb/dict
//下载json词典，放到dict目录下

let read = './dict/'
let save = "./res/";

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, 'BEC_2.json')

function formatDict(path, name) {
  try {
    let newObj = []
    let str = fs.readFileSync(path + name, "utf8");
    let list = str.split('\n')
    list.map(v => {
      if (!v) return
      let item = JSON.parse(v)
      // console.log('v', item.headWord)
      newObj.push(item.headWord)
    })

    // fs.writeFileSync(save + name, JSON.stringify(newObj, null, 2));
    fs.writeFileSync(save + name.replace('.json', '_word.json'), JSON.stringify(newObj));
    console.log(name, newObj.length)
  } catch (e) {
    console.log('err', name, e)
  }
}

