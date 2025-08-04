import fs from 'fs';
import path from 'path';
import {chromium} from 'playwright';
import pLimit from 'p-limit';
import {fileURLToPath} from 'url';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 路径设置
const SOURCE_DIR = path.join(__dirname, 'source');
const SAVE_DIR = path.join(__dirname, 'save');
const TOTAL_RESULT_FILE = path.join(__dirname, 'save', 'all.json');


const existingMap = new Map();
// 加载已爬数据（增量去重）
if (fs.existsSync(TOTAL_RESULT_FILE)) {
  const lines = fs.readFileSync(TOTAL_RESULT_FILE, 'utf-8').split('\n').filter(Boolean);
  console.log(lines.length)
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj?.word) {
        existingMap.set(obj.word, obj);
      }
    } catch {
    }
  }
  console.log(`📦 已加载 ${existingMap.size} 个已爬词`);
}


let normalList = new Map();
let unnormalList = new Map();


const safeString = (str) => (typeof str === 'string' ? str.trim() : '');
const safeSplit = (str, sep) =>
  safeString(str) ? safeString(str).split(sep).filter(Boolean) : [];


function getTrans(trans) {
  return safeSplit(trans, '\n').map(line => {
    const match = line.match(/^([^\s.]+\.?)\s*(.*)$/);
    if (match) {
      let pos = safeString(match[1]);
      let cn = safeString(match[2]);

      // 如果 pos 不是常规词性（不以字母开头），例如 "【名】"
      if (!/^[a-zA-Z]+\.?$/.test(pos)) {
        cn = safeString(line); // 整行放到 cn
        pos = ''; // pos 置空
      }

      return {pos, cn};
    }
    return {pos: '', cn: safeString(line)};
  });
}

(async () => {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    raw.filter(v => v && v.name && String(v.name).trim()).map(v => {
      let word = String(v.name)
      word = word.trim()
      if (word.endsWith('.')) {
        word = word.substring(0, word.length - 1);
      }
      let r = existingMap.get(word)
      if (!r) {
        r = {
          "word": String(word),
          "phonetic0": v?.ukphone?.replaceAll('[', '')?.replaceAll(']', '') || '',
          "phonetic1": v?.usphone?.replaceAll('[', '')?.replaceAll(']', '') || '',
          "trans": [],
          "sentences": [],
          "phrases": [],
          "synos": [],
          "relWords": {"root": "", "rels": []},
          "etymology": [],
        }
        if (Array.isArray(v.trans)) {
          r.trans = getTrans(v.trans.filter(a => a && a.length < 150).slice(0, 3).join('\n'));
        } else {
          r.trans = v.trans ? getTrans(v.trans) : [];
        }
        if (word.includes('/') || word.includes(' ') || word.includes('(') || word.includes(')') || word.includes('（') || word.includes('）')) {
          unnormalList.set(word, r)
        } else {
          normalList.set(word, r)
        }
      }
    })
  }
  console.log(normalList.size, unnormalList.size)
  fs.writeFileSync(path.join(SAVE_DIR, 'normalList.json'), JSON.stringify(Array.from(normalList.values()), null, 2), 'utf-8');
  fs.writeFileSync(path.join(SAVE_DIR, 'unnormalList.json'), JSON.stringify(Array.from(unnormalList.values()), null, 2), 'utf-8');
})();
