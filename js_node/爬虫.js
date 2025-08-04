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
const RESULT_DIR = path.join(__dirname, 'result');
const TOTAL_RESULT_FILE = path.join(__dirname, 'save', 'all.json');
const normalList_FILE = path.join(__dirname, 'save', 'normalList.json');
const unnormalList_FILE = path.join(__dirname, 'save', 'unnormalList.json');
const FAILED_FILE = path.join(__dirname, 'save', 'failed.json');

// 控制参数
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_COUNT = 999999999999;

let failList = []
let crawlCount = 0;
const existingMap = new Map();

// 创建结果目录
if (!fs.existsSync(RESULT_DIR)) {
  fs.mkdirSync(RESULT_DIR);
}

// 加载已爬数据（增量去重）
if (fs.existsSync(TOTAL_RESULT_FILE)) {
  const lines = fs.readFileSync(TOTAL_RESULT_FILE, 'utf-8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj?.word) {
        existingMap.set(obj.word.toLowerCase(), obj);
      }
    } catch {
    }
  }
  console.log(`📦 已加载 ${existingMap.size} 个已爬词`);
}

const failStr = fs.readFileSync(FAILED_FILE, 'utf-8')

if (failStr) {
  failList = JSON.parse(failStr)
}

function addToFail(val) {
  if (!failList.find(v => v.word === val.word)) {
    failList.push(val);
    fs.writeFileSync(FAILED_FILE, JSON.stringify(failList, null, 2), 'utf-8');
  }
}

// 爬虫主函数
async function crawlWord(val, page, retry = 0, failName) {
  let word = val.word
  const data = val
  const url = `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`;

  try {
    await page.goto(url, {waitUntil: 'networkidle', timeout: 15000});

    const titleEl = await page.locator('.title').first();
    data.word = await titleEl.evaluate(el => el.firstChild?.nodeValue || '');

    const phones = await page.$$('.per-phone .phonetic');
    if (phones[0]) data.phonetic0 = (await phones[0].textContent())?.trim() || '';
    if (phones[1]) data.phonetic1 = (await phones[1].textContent())?.trim() || '';
    data.phonetic0 = data.phonetic0.replaceAll('/', '').trim()
    data.phonetic1 = data.phonetic1.replaceAll('/', '').trim()

    for (const el of await page.$$('.basic .word-exp')) {
      const pos = await el.$('.pos');
      const tran = await el.$('.trans');
      data.trans.push({
        pos: pos ? (await pos.textContent())?.trim() : '',
        cn: tran ? (await tran.textContent())?.trim() : '',
      });
    }

    for (const el of await page.$$('.blng_sents_part .trans-container ul li .col2')) {
      const en = await el.$('.sen-eng');
      const ch = await el.$('.sen-ch');
      data.sentences.push({
        c: en ? (await en.textContent())?.trim() : '',
        cn: ch ? (await ch.textContent())?.trim() : '',
      });
    }

    for (const el of await page.$$('.phrs ul li .phrs-content')) {
      const point = await el.$('.point');
      const tran = await el.$('.phr_trans');
      data.phrases.push({
        c: point ? (await point.textContent())?.trim() : '',
        cn: tran ? (await tran.textContent())?.trim() : '',
      });
    }

    try {
      await page.getByText('同近义词', {timeout: 2000}).click();
      await page.waitForSelector('.syno', {timeout: 3000});
      for (const el of await page.$$('.syno-item')) {
        const pos = await el.$('.index');
        const tran = await el.$('.synptran');
        const wordEl = await el.$('.clickable');
        let str = wordEl ? (await wordEl.textContent())?.trim() : '';
        data.synos.push({
          pos: pos ? (await pos.textContent())?.trim() : '',
          cn: tran ? (await tran.textContent())?.trim() : '',
          ws: str.split('/').map(s => s.trim()).filter(Boolean),
        });
      }
    } catch {
    }

    try {
      await page.getByText('同根词', {timeout: 2000}).click();
      await page.waitForSelector('.rel_word', {timeout: 3000});
      const cigen = await page.$('.trans-container > p .point');
      data.relWords.root = cigen ? (await cigen.textContent())?.trim() : '';
      for (const el of await page.$$('.rel_word_item')) {
        let item = {pos: '', words: []};
        const pos = await el.$('.pos');
        item.pos = pos ? (await pos.textContent())?.trim() : '';
        for (const el2 of await el.$$('.rel_content p')) {
          const word = await el2.$('.point');
          let wordStr = word ? (await word.textContent())?.trim() : '';
          let str = el2 ? (await el2.textContent())?.trim() : '';
          str = str.replace(wordStr, '');
          item.words.push({c: wordStr, cn: str});
        }
        data.relWords.rels.push(item);
      }
    } catch {
    }

    try {
      await page.getByText('词源', {timeout: 2000}).click();
      await page.waitForSelector('.etymology', {timeout: 3000});
      for (const el of await page.$$('.trans-cell')) {
        const header = await el.$('.header');
        const zh_result = await el.$('.zh_result');
        data.etymology.push({
          t: header ? (await header.textContent())?.trim() : '',
          d: zh_result ? (await zh_result.textContent())?.trim() : '',
        });
      }
    } catch {
    }

    return data;
  } catch (err) {
    return data;

    if (retry < 2) {
      console.log(`🔁 ${word} 抓取失败，重试中...`);
      await sleep(1000);
      return crawlWord(val, page, retry + 1, failName);
    } else {
      console.log(`❌ ${word} 抓取失败`);
      addToFail(val)
      return data;
    }
  }
}

(async () => {
  const browser = await chromium.launch({headless: true});
  const page = browser.newPage()

  async function start(file) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const resultMap = new Map();

    for (let i = 0; i < MAX_COUNT; i++) {
      let word = raw[i];
      console.log(`爬取：${file}，${word.word}，进度：${resultMap.size} / ${raw.length}；时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
      const result = await crawlWord(word, page, 0, file);
      if (result) {
        resultMap.set(word.word, result);
        fs.writeFileSync(file.replaceAll('.json', '-fetch.json'), JSON.stringify(Array.from(resultMap.values()), null, 2), 'utf-8');
      }
      await sleep(2300);
    }
  }

  await start(unnormalList_FILE)
  await start(normalList_FILE)
  await browser.close();

  console.log('\n🎉 所有任务完成！');
})();
