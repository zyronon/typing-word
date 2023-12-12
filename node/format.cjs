let path = require("path");
let fs = require("fs");

let fileName = 'CET4_1.json'
let read = './dict/'
let save = "./format/";

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, fileName)

function formatDict(path, name) {
  try {
    let newObj = []
    const str = fs.readFileSync(path + name, "utf8");
    let list = str.split('\n')
    list.map(v => {
      if (!v) return
      let item = JSON.parse(v)
      // console.log('v', item.headWord)
      let data = {
        id: item.wordRank,
        word: item.headWord,
        trans: [],
        phonetic0: item.content.word.content.usphone,
        phonetic1: item.content.word.content.ukphone,
        sentences: [],
        relWords: [],
        phrases: [],
        synos: [],
        remMethod: ''
      }
      if (item.content.word.content.trans) {
        data.trans = item.content.word.content.trans.map(s => {
          return {
            pos: s.pos,
            cn: s.tranCn,
            en: s.tranOther
          }
        })
      }
      if (item.content.word.content.sentence) {
        data.sentences = item.content.word.content.sentence.sentences.map(s => {
          return {
            v: s.sCn, tran: s.sContent,
          }
        })
      }
      if (item.content.word.content.remMethod) {
        data.memory = item.content.word.content.remMethod.val
      }
      if (item.content.word.content.relWord) {
        data.relWords = item.content.word.content.relWord.rels.map(s => {
          return {
            "pos": s.pos,
            "ws": s.words.map(a => {
              return {
                w: a.hwd,
                tran: a.tran
              }
            })
          }
        })
      }
      if (item.content.word.content.phrase) {
        data.phrases = item.content.word.content.phrase.phrases.map(s => {
          return {
            v: s.pCn,
            tran: s.pContent,
          }
        })
      }
      if (item.content.word.content.syno) {
        data.synos = item.content.word.content.syno.synos.map(s => {
          return {
            pos: s.pos,
            tran: s.tran,
            ws: s.hwds
          }
        })
      }
      newObj.push(data)
    })

    // fs.writeFileSync(save + name, JSON.stringify(newObj, null, 2));
    fs.writeFileSync(save + name.replace('.json', '.min.json'), JSON.stringify(newObj));
    console.log(name, newObj.length)
  } catch (e) {
    console.log('err', name, e)
  }
}

