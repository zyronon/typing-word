let path = require("path");
let fs = require("fs");
let axios = require('axios')

let DictType = {
  word: 'word'
}

const json = [
  {
    id: 'adult self-study examination',
    name: '专升本词汇',
    description: '专升本词汇',
    category: '中国考试',
    tags: ['其他'],
    url: 'adult-self-study-examination.json',
    length: 3692,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'coca_20000',
    name: 'COCA20000词',
    description: 'COCA20000词',
    category: '中国考试',
    tags: ['其他'],
    url: 'coca20000.json',
    length: 20199,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Merriam_Webster_sVocabularyBuilder',
    name: '韦氏词根词典',
    description: '韦氏词根词典',
    category: '中国考试',
    tags: ['其他'],
    url: 'Merriam_Webster_sVocabularyBuilder.json',
    length: 1191,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
]

async function sleep(val) {
  return new Promise(resolve => {
    setTimeout(resolve, val)
  })
}

async function c(dict) {
  // dict = newDicts[0]
  let url = `../public/dicts/${dict.language}/${dict.type}/${dict.translateLanguage}/${dict.url}`;
  return new Promise((resolve, reject) => {
    try {
      let str = fs.readFileSync(url, "utf8");
      let list = JSON.parse(str)
      dict.words = list.map(v => v.word)
      dict.tags = dict.tags.filter(v => {
        return v !== '所有'
      })
      console.log('  ')
      console.log('----------------------')
      console.log('名字', dict.name, dict.url, dict.length, dict.tags)
      axios({
        url: 'http://localhost/index.php/v1/support/addDict', method: 'post', data: dict
      }).then(r => {
        if (r.data.success) {
          console.log(r.data.msg, r.data.data)
          fs.writeFileSync('./failDict.txt', JSON.stringify(r.data.data, null, 2));
          fs.writeFileSync(`./uploadDict/${dict.url}`, JSON.stringify(dict, null, 2));
          resolve(true)

          fs.unlink(url, (err) => {
            resolve(true)
            if (err) throw err;
            console.log(dict.name, '已删除');
            console.log('----------------------')
          });
        } else {
          resolve(true)
          console.log('失败1', r.data.msg)
        }
      }).catch(r => {
        resolve(true)
        console.log('失败2', r)
      })
    } catch (e) {
      resolve(true)
      console.log('读取文件失败', dict.name, e)
    }
  })
}

async function s() {
  for (let i = 0; i < json.length; i++) {
    let v = json[i]
    console.log('进度', (i / json.length).toFixed(2))
    await c(v)
    // await sleep(5000)
  }
}

// console.log(json[0])
// c(json[0])
s()

