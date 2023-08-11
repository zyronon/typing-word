<script setup>
import Modal from "@/components/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";
import {Close, ShareThree, KeyboardOne, Tea, Like} from '@icon-park/vue-next'
import Ring from "@/components/Ring.vue";
import Tooltip from "@/components/Tooltip.vue";
import {onMounted} from "vue";
import {getRandom} from "@/utils/index.js";

const store = useBaseStore()
const canvas = $ref()

onMounted(() => {
  let ocas = document.createElement("canvas");
  let octx = ocas.getContext("2d");
  let ctx = canvas.getContext("2d");
  ocas.width = canvas.width = window.innerWidth;
  ocas.height = canvas.height = window.innerHeight;
  let bigBooms = [];
  let lastTime;

  Array.prototype.foreach = function (callback) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== null) callback.apply(this[i], [i]);
    }
  };

  let raf =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };


  function initAnimate() {
    lastTime = new Date();
    animate();
  }

  initAnimate()

  function animate() {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    let newTime = new Date();
    if (newTime - lastTime > 200 + (window.innerHeight - 767) / 2) {
      let random = Math.random() * 100 > 2;
      let x = getRandom(canvas.width / 5, (canvas.width * 4) / 5);
      let y = getRandom(50, 200);
      let bigBoom
      if (random) {
        bigBoom = new Boom(
            getRandom(canvas.width / 3, (canvas.width * 2) / 3),
            2,
            "#FFF",
            {x: x, y: y}
        );
      } else {
        bigBoom = new Boom(
            getRandom(canvas.width / 3, (canvas.width * 2) / 3),
            2,
            "#FFF",
            {x: canvas.width / 2, y: 200,},
            document.querySelectorAll(".shape")[parseInt(getRandom(0, document.querySelectorAll(".shape").length))]
        );
      }
      bigBooms.push(bigBoom);
      lastTime = newTime;
    }

    bigBooms.foreach(function (index) {
      let that = this;
      if (!this.dead) {
        this._move();
        this._drawLight();
      } else {
        this.booms.foreach(function (index) {
          if (!this.dead) {
            this.moveTo(index);
          } else if (index === that.booms.length - 1) {
            bigBooms.splice(bigBooms.indexOf(that), 1);
          }
        });
      }
    });

    raf(animate);
  }

  canvas.onclick = function () {
    let x = event.clientX;
    let y = event.clientY;
    let bigboom = new Boom(
        getRandom(canvas.width / 3, (canvas.width * 2) / 3),
        2,
        "#FFF",
        {x: x, y: y}
    );
    bigBooms.push(bigboom);
  };

  class Boom2 {
    booms = [];
    x;
    y;
    r;
    c;
    shape;
    boomArea;
    theta;
    dead;
    ba;

    constructor(x, r, c, boomArea, shape) {
      this.x = x;
      this.y = canvas.height + r;
      this.r = r;
      this.c = c;
      this.shape = shape || false;
      this.boomArea = boomArea;
      this.theta = 0;
      this.dead = false;
      this.ba = parseInt(getRandom(80, 200));

      let audio = document.getElementsByTagName("audio");
      for (let i = 0; i < audio.length; i++) {
        if (
            audio[i].src.indexOf("shotfire") >= 0 &&
            (audio[i].paused || audio[i].ended)
        ) {
          audio[i].play();
          break;
        }
      }
    }
  }

  let Boom = function (x, r, c, boomArea, shape) {
    this.booms = [];
    this.x = x;
    this.y = canvas.height + r;
    this.r = r;
    this.c = c;
    this.shape = shape || false;
    this.boomArea = boomArea;
    this.theta = 0;
    this.dead = false;
    this.ba = parseInt(getRandom(80, 200));

    let audio = document.getElementsByTagName("audio");
    for (let i = 0; i < audio.length; i++) {
      if (
          audio[i].src.indexOf("shotfire") >= 0 &&
          (audio[i].paused || audio[i].ended)
      ) {
        audio[i].play();
        break;
      }
    }
  };
  Boom.prototype = {
    _paint: function () {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = this.c;
      ctx.fill();
      ctx.restore();
    },
    _move: function () {
      let dx = this.boomArea.x - this.x,
          dy = this.boomArea.y - this.y;
      this.x = this.x + dx * 0.01;
      this.y = this.y + dy * 0.01;

      if (Math.abs(dx) <= this.ba && Math.abs(dy) <= this.ba) {
        if (this.shape) {
          this._shapBoom();
        } else this._boom();
        this.dead = true;
      } else {
        this._paint();
      }
    },
    _drawLight: function () {
      ctx.save();
      ctx.fillStyle = "rgba(255,228,150,0.3)";
      ctx.beginPath();
      ctx.arc(
          this.x,
          this.y,
          this.r + 3 * Math.random() + 1,
          0,
          2 * Math.PI
      );
      ctx.fill();
      ctx.restore();
    },
    _boom: function () {
      let fragNum = getRandom(100, 300);
      let style = getRandom(0, 10) >= 5 ? 1 : 2;
      let color;
      if (style === 1) {
        color = {
          a: parseInt(getRandom(128, 255)),
          b: parseInt(getRandom(128, 255)),
          c: parseInt(getRandom(128, 255)),
        };
      }

      let fanwei = fragNum;
      let audio = document.getElementsByTagName("audio");
      for (let i = 0; i < audio.length; i++) {
        if (
            audio[i].src.indexOf("boom") >= 0 &&
            (audio[i].paused || audio[i].ended)
        ) {
          audio[i].play();
          break;
        }
      }
      for (let i = 0; i < fragNum; i++) {
        if (style === 2) {
          color = {
            a: parseInt(getRandom(128, 255)),
            b: parseInt(getRandom(128, 255)),
            c: parseInt(getRandom(128, 255)),
          };
        }
        let a = getRandom(-Math.PI, Math.PI);
        let x = getRandom(0, fanwei) * Math.cos(a) + this.x;
        let y = getRandom(0, fanwei) * Math.sin(a) + this.y;
        let radius = getRandom(0, 2);
        let frag = new Frag(this.x, this.y, radius, color, x, y);
        this.booms.push(frag);
      }
    },
    _shapBoom: function () {
      let that = this;
      putValue(ocas, octx, this.shape, 5, function (dots) {
        let dx = canvas.width / 2 - that.x;
        let dy = canvas.height / 2 - that.y;
        for (let i = 0; i < dots.length; i++) {
          let color = {a: dots[i].a, b: dots[i].b, c: dots[i].c};
          let x = dots[i].x;
          let y = dots[i].y;
          let radius = 1;
          let frag = new Frag(
              that.x,
              that.y,
              radius,
              color,
              x - dx,
              y - dy
          );
          that.booms.push(frag);
        }
      });
    },
  };

  function putValue(canvas, context, ele, dr, callback) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    if (ele.innerHTML.indexOf("img") >= 0) {
      img.src = ele.getElementsByTagName("img")[0].src;
      imgload(img, function () {
        context.drawImage(
            img,
            canvas.width / 2 - img.width / 2,
            canvas.height / 2 - img.width / 2
        );
        let dots = getimgData(canvas, context, dr);
        callback(dots);
      });
    } else {
      let text = ele.innerHTML;
      context.save();
      let fontSize = 200;
      context.font = fontSize + "px 宋体 bold";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle =
          "rgba(" +
          parseInt(getRandom(128, 255)) +
          "," +
          parseInt(getRandom(128, 255)) +
          "," +
          parseInt(getRandom(128, 255)) +
          " , 1)";
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      context.restore();
      let dots = getimgData(canvas, context, dr);
      callback(dots);
    }
  }

  function imgload(img, callback) {
    if (img.complete) {
      callback.call(img);
    } else {
      img.onload = function () {
        callback.call(this);
      };
    }
  }

  function getimgData(canvas, context, dr) {
    let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    let dots = [];
    for (let x = 0; x < imgData.width; x += dr) {
      for (let y = 0; y < imgData.height; y += dr) {
        let i = (y * imgData.width + x) * 4;
        if (imgData.data[i + 3] > 128) {
          let dot = {
            x: x,
            y: y,
            a: imgData.data[i],
            b: imgData.data[i + 1],
            c: imgData.data[i + 2],
          };
          dots.push(dot);
        }
      }
    }
    return dots;
  }


  let Frag = function (centerX, centerY, radius, color, tx, ty) {
    this.tx = tx;
    this.ty = ty;
    this.x = centerX;
    this.y = centerY;
    this.dead = false;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.color = color;
  };

  Frag.prototype = {
    paint: function () {
      // ctx.beginPath();
      // ctx.arc(this.x , this.y , this.radius , 0 , 2*Math.PI);
      ctx.fillStyle =
          "rgba(" +
          this.color.a +
          "," +
          this.color.b +
          "," +
          this.color.c +
          ",1)";
      ctx.fillRect(
          this.x - this.radius,
          this.y - this.radius,
          this.radius * 2,
          this.radius * 2
      );
    },
    moveTo: function (index) {
      this.ty = this.ty + 0.3;
      let dx = this.tx - this.x,
          dy = this.ty - this.y;
      this.x = Math.abs(dx) < 0.1 ? this.tx : this.x + dx * 0.1;
      this.y = Math.abs(dy) < 0.1 ? this.ty : this.y + dy * 0.1;
      if (dx === 0 && Math.abs(dy) <= 80) {
        this.dead = true;
      }
      this.paint();
    },
  };

})
</script>

<template>
  <Modal v-model="store.dictModalIsOpen2">
    <div class="statistics">
      <header>
        <div class="title">新概念英语-2 第3章</div>
      </header>
      <div class="content">
        <div class="rings">
          <Ring/>
          <Ring/>
          <Ring style="margin-bottom: 0;"/>
        </div>
        <div class="result">
          <div class="wrong-words-wrapper">
            <div class="wrong-words">
              <div class="word" v-for="i in 500">Yes</div>
            </div>
          </div>

          <div class="notice">
            <like theme="filled" size="20" fill="#ffffff" :strokeWidth="2"/>
            表现不错，全对了！
          </div>
        </div>
        <div class="shares">
          <Tooltip title="分享给朋友">
            <share-three theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
          <Tooltip title="分享给朋友">
            <tea theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
          <Tooltip title="分享给朋友">
            <share-three theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
        </div>
      </div>
      <div class="footer">
        <Tooltip title="Ctrl + Enter键默写本章节">
          <div class="my-button large">
            默写本章节
            <div class="key-notice">
              <keyboard-one theme="outline" size="14" fill="#ffffff" :strokeWidth="2"/>
              <span>Ctrl + Enter</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="按Enter键重复本章节">
          <div class="my-button large">
            重复本章节
            <div class="key-notice">
              <keyboard-one theme="outline" size="14" fill="#ffffff" :strokeWidth="2"/>
              <span>Enter</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="按Tab键进行下一章节">
          <div class="my-button large  ">
            下一章节
            <div class="key-notice">
              <keyboard-one theme="outline" size="14" fill="#ffffff" :strokeWidth="2"/>
              <span>Tab</span>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  </Modal>
  <Teleport to="body">
    <canvas ref="canvas"/>
  </Teleport>
</template>
<style scoped lang="scss">
@import "@/assets/css/style";

.statistics {
  width: 50vw;
  padding: $space;
  background: $dark-second-bg;
  border-radius: $card-radius;

  $header-height: 40rem;
  $footer-height: 60rem;

  header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: $header-height;
    font-size: 24rem;
    margin-bottom: 15rem;
  }

  .content {
    display: flex;
    gap: $space;
    margin-bottom: 15rem;

    .result {
      flex: 1;
      box-sizing: border-box;
      overflow: hidden;

      .wrong-words-wrapper {
        border-radius: $card-radius $card-radius 0 0;
        background: $item-hover;
        padding-top: $space;

      }

      .wrong-words {
        padding: $space;
        padding-top: 0;
        height: 30vh;
        box-sizing: border-box;
        overflow: auto;
        display: flex;
        margin-right: 5rem;
        flex-wrap: wrap;
        gap: 10rem;
        align-items: flex-start;

        .word {
          display: inline-block;
          border-radius: 6rem;
          padding: 5rem 15rem;
          background: $dark-second-bg;
        }
      }

      .notice {
        border-radius: 0 0 $card-radius $card-radius;
        background: $main;
        height: 40rem;
        display: flex;
        gap: 10rem;
        align-items: center;
        padding-left: $space;
      }
    }

    .shares {
      display: flex;
      flex-direction: column;
      gap: $space;
    }
  }

  .footer {
    height: $footer-height;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20rem;

    .key-notice {
      margin-left: 10rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12rem;
      gap: 2rem;
    }
  }
}

canvas {
  z-index: 99999;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

</style>