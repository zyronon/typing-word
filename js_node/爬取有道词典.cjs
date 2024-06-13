const https = require('https')
const {JSDOM} = require("jsdom");
const $ = require("jquery");

const axios = require('axios')
axios('https://dict.youdao.com/result?word=private&lang=en').then(r => {
  // console.log('r', r.data)
  const {window} = new JSDOM(r.data);
  const $ = require("jquery")(window);

  let data = {
    word: '',
    phonetic0: '',
    phonetic1: '',
    trans: [],
    sentences: [],
    phrases: [],
    synos: [],
    relWords: [],
    memory: ''
  }
  data.word = $('.title')[0].firstChild.nodeValue


  //解析音标
  let s = $('.per-phone .phonetic')
  if (s && s.length) {
    data.phonetic0 = s[0].textContent
    if (s.length === 2) data.phonetic1 = s[1].textContent
  }

  //解析翻译
  $('.basic .word-exp').each(function () {
    let item = {}
    item.pos = $(this).find('.pos').text()
    item.cn = $(this).find('.trans').text()
    data.trans.push(item)
  })

  //解析例句
  $('.blng_sents_part .trans-container ul li .col2').each(function () {
    let item = {}
    item.v = $($(this).children()[0]).find('.sen-eng').text()
    item.trans = $($(this).children()[1]).find('.sen-ch').text()
    data.sentences.push(item)
  })

  //解析词典短语
  $('.phrs ul li .phrs-content').each(function () {
    let item = {}
    item.v = $(this).find('.point').text()
    item.trans = $(this).find('.phr_trans').text()
    data.phrases.push(item)
  })


  let tabs = $('#catalogue_usage .dict-tabs .tab-item')
  if (tabs.length && tabs.length > 1) {
    $(tabs[1]).trigger('click')
    $(tabs[1]).click()

    setTimeout(() => {
      //解析同近义词
      $('.syno ul li .syno-content').each(function () {
        let item = {}
        item.v = $(this).find('.synptran').text()
        item.trans = $(this).find('.clickable').text()
        data.synos.push(item)
      })
      // console.log('data', data)

      console.log($('.syno'))
    }, 500)
  }
  // console.log('data', data)
})