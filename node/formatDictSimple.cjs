let path = require("path");
let fs = require("fs");

const str = fs.readFileSync("../public/dicts/en/zh-CN/translate/translate.json", "utf8");
let translateDict = JSON.parse(str);


let pathName = "../public/dicts/en/zh-CN";
// let pathName = "./d";

const dirs = fs.readdirSync(pathName)
dirs.forEach(dictName => {
  if (!dictName.includes('translate.json') || !dictName.includes('ts.json')) {
    let dictPath = path.join(pathName, dictName)
    // console.log('d', dictPath)
    formatDict(dictPath)
  }
})

function formatDict(path) {
  try {
    const str = fs.readFileSync(path, "utf8");
    let dicts = JSON.parse(str);
    dicts = dicts.map(v => {
      let data = {
        "name": v.name,
        "trans": [],
        usphone: '',
        ukphone: '',
      }
      return data
    })
    let newDicts = Array.from(new Set(dicts))
    fs.writeFileSync(
      path,
      JSON.stringify(newDicts, null, 2)
    );
  } catch (e) {
    // console.log('err', e)
  }
}

