let path = require("path");
let fs = require("fs");

const str = fs.readFileSync("../public/dicts/en/zh-CN/translate/translate.json", "utf8");
let translateDict = JSON.parse(str);
let ts = []

console.log(translateDict.length)

let pathName = "../public/dicts/en/zh-CN";
// let pathName = "./d";

//判断是不是目录
const dirs = fs.readdirSync(pathName)
dirs.forEach(dictName => {
  if (!dictName.includes('translate.json') || !dictName.includes('ts.json')) {
    let dictPath = path.join(pathName, dictName)
    // console.log('d', dictPath)
    formatDict(dictPath)
  }
})

fs.writeFileSync(
  "../public/dicts/en/zh-CN/translate/ts.json",
  JSON.stringify(ts, null, 2)
);
console.log(ts.length)

function formatDict(path) {
  try {
    const str = fs.readFileSync(path, "utf8");
    let dicts = JSON.parse(str);
    dicts = dicts.map(v => {
      if (!translateDict.find(w => w.name === v.name)) {
        if (!v.trans) {
          console.log(path, v)
        }
        let data = {
          "name": "",
          "trans": [],
          usphone: '',
          ukphone: '',
          ...v
        }
        translateDict.push(data)
        ts.push(data)
      }
      // delete v.trans
      // delete v.usphone
      // delete v.ukphone
      return v.name
    })
    // let newDicts = Array.from(new Set(dicts))
    // console.log(dicts.length);
    // console.log(newDicts.length);

    // fs.writeFileSync(
    //   path,
    //   JSON.stringify(newDicts, null, 2)
    // );
  } catch (e) {
    // console.log('err', e)
  }
}

