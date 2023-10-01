// ==UserScript==
// @name         Youtube新标签页打开
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Youtube新标签页打开.
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @license MIT
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function load() {
    console.log('load1')
    setTimeout(() => {
      console.log('load2')
      window.addEventListener('click', function (e) {
        let list = e.target.classList
        let isStop = Array.from(list).some(v => v.includes('preview'))
        if (isStop && location.pathname !== '/watch') {
          event.stopPropagation()
        }
      }, true);

      const ele = document.querySelector('#media-container-link')
      ele.setAttribute("target", "_blank");

      let imgList = $('img.yt-core-image')
      imgList.each(function (v) {
        let a = this.parentNode.parentNode
        a.setAttribute("target", "_blank");
      })
    })
  }

  // window.addEventListener('load', load)
  //火狐不触发load事件
  setTimeout(load, 3000)
})();