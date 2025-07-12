const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');

const SOURCE_DIR = path.join(__dirname, 'source');
const RESULT_DIR = path.join(__dirname, 'result');
const TOTAL_RESULT_FILE = path.join(__dirname + '/save/', 'all.json');
const FAILED_FILE = path.join(__dirname + '/save/', 'failed.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_COUNT = 1;

let crawlCount = 0;
const failedWords = [];
const existingMap = new Map();

if (!fs.existsSync(RESULT_DIR)) {
  fs.mkdirSync(RESULT_DIR);
}

// ✅ 加载已爬数据（增量去重）
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

// ✅ 立即写入 all.json
function appendToAll(result) {
  fs.appendFileSync(TOTAL_RESULT_FILE, JSON.stringify(result) + '\n', 'utf-8');
}

async function crawlWord(word, page, retry = 0) {
  word = 'private'
  const data = {
    word: word,
    phonetic0: '',
    phonetic1: '',
    trans: [],
    sentences: [],
    phrases: [],
    synos: [],
    relWords: {
      root: '',
      rels: []
    },
    etymology: [],
  };

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

    const trans = await page.$$('.basic .word-exp');
    for (const el of trans) {
      const pos = await el.$('.pos');
      const tran = await el.$('.trans');
      data.trans.push({
        pos: pos ? (await pos.textContent())?.trim() : '',
        cn: tran ? (await tran.textContent())?.trim() : '',
      });
    }

    const sentList = await page.$$('.blng_sents_part .trans-container ul li .col2');
    for (const el of sentList) {
      const en = await el.$('.sen-eng');
      const ch = await el.$('.sen-ch');
      data.sentences.push({
        c: en ? (await en.textContent())?.trim() : '',
        cn: ch ? (await ch.textContent())?.trim() : '',
      });
    }

    const phrs = await page.$$('.phrs ul li .phrs-content');
    for (const el of phrs) {
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
      const synos = await page.$$('.syno-item');
      for (const el of synos) {
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
      data.relWords.root = cigen ? (await cigen.textContent())?.trim() : ''

      const rel_word_item_list = await page.$$('.rel_word_item');
      for (const el of rel_word_item_list) {
        let item = {
          words: []
        }
        const pos = await el.$('.pos');
        item.pos = pos ? (await pos.textContent())?.trim() : ''

        const rel_content_list = await el.$$('.rel_content p');
        for (const el2 of rel_content_list) {
          const word = await el2.$('.point');
          let wordStr = word ? (await word.textContent())?.trim() : ''
          let str = el2 ? (await el2.textContent())?.trim() : ''
          str = str.replace(wordStr, '');

          item.words.push({
            c: wordStr,
            cn: str
          })
        }
        data.relWords.rels.push(item);
      }
    } catch (e) {
      console.log('报错了', e)
    }

    try {
      await page.getByText('词源', {timeout: 2000}).click();
      await page.waitForSelector('.etymology', {timeout: 3000});
      const trans_cell = await page.$$('.trans-cell');
      for (const el of trans_cell) {
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
    if (retry < 2) {
      console.log(`🔁 ${word} 抓取失败，重试中...`);
      await sleep(1000);
      return crawlWord(word, page, retry + 1);
    } else {
      console.log(`❌ ${word} 抓取失败`);
      failedWords.push(word);
      return null;
    }
  }
}

(async () => {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const wordList = raw.map(obj => obj.word).filter(Boolean);

    const resultForThisFile = [];
    console.log(`📂 处理文件：${file}，共 ${wordList.length} 个单词`);

    for (let i = 0; i < wordList.length; i++) {
      let word = wordList[i]
      const lowerWord = word.toLowerCase();
      if (existingMap.has(lowerWord) && false) {
        console.log(`⚪ 已爬过 ${word}，跳过`);
        // 把之前爬取的内容也加入当前文件结果数组
        const existData = existingMap.get(lowerWord);
        if (existData) {
          resultForThisFile.push(existData);
        }
        continue;
      }
      if (crawlCount >= MAX_COUNT) {
        console.log(`🚫 达到调试上限 ${MAX_COUNT}，终止爬取`);
        break;
      }

      console.log(`爬取：${file}，${word}，进度：${i} / ${wordList.length}`)
      const result = await crawlWord(word, page);
      if (result) {
        crawlCount++;
        appendToAll(result);
        resultForThisFile.push(result);
        existingMap.set(lowerWord, result);
      }

      await sleep(500);
    }

    const outputName = path.basename(file, '.json') + '_v2.json';
    const outputPath = path.join(RESULT_DIR, outputName);
    fs.writeFileSync(outputPath, JSON.stringify(resultForThisFile, null, 2), 'utf-8');
    console.log(`✅ 已保存：${outputName}`);
  }

  await browser.close();

  // ✅ 保存失败词
  if (failedWords.length) {
    fs.writeFileSync(FAILED_FILE, JSON.stringify(failedWords, null, 2), 'utf-8');
    console.log(`❗ 失败词写入 ${FAILED_FILE}`);
  }

  console.log('\n🎉 所有任务完成！');
})();
