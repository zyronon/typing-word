<template>
  <Teleport to="body">
    <canvas ref="canvas"/>
  </Teleport>
</template>

<script setup>
import {onMounted} from "vue";
import {getRandom} from "@/utils/index.ts";
import boom from '@/assets/sound/boom.mp3'
import shotfire from '@/assets/sound/shotfire.mp3'
import {useSound} from "@/hooks/useSound.ts";

const canvas = $ref()
const [playBoom] = useSound([boom], 3)
const [playShotfire] = useSound([shotfire], 3)

onMounted(() => {
  let ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let bigBooms = [];
  let lastTime;

  let raf = window.requestAnimationFrame
  let count = 0
  let isBreak = false

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
    if (newTime - lastTime > 200 + (window.innerHeight - 767) / 2 && count < 11) {
      let boomArea
      let startX
      if (count % 2 === 0) {
        startX = getRandom(0, canvas.width * 0.1);
        // startX = getRandom(500, 700);
        boomArea = {
          x: getRandom(canvas.width * 0.1, canvas.width * 0.3),
          y: getRandom(50, 200)
        }
      } else {
        startX = getRandom(canvas.width * 0.9, canvas.width);
        boomArea = {
          x: getRandom(canvas.width * 0.7, canvas.width * 0.9),
          y: getRandom(50, 200)
        }
      }

      let bigBoom = new Boom(
          startX,
          2,
          "#FFF",
          boomArea
      );
      bigBooms.push(bigBoom);
      lastTime = newTime;
      count++
    }

    bigBooms.map((itemI) => {
      if (!itemI.dead) {
        itemI._move();
      } else {
        itemI.booms.map((itemJ, index) => {
          if (!itemJ.dead) {
            itemJ.moveTo();
          } else if (index === itemI.booms.length - 1) {
            bigBooms.splice(bigBooms.indexOf(itemI), 1);
          }
        });
        if (bigBooms.length === 0) {
          setTimeout(() => {
            isBreak = true
          }, 1000)
        }
      }
    });

    if (!isBreak) {
      raf(animate);
    } else {
      // ctx.globalCompositeOperation = 'source-over'
      // ctx.globalAlpha = 0;
      // ctx.fillStyle = 'transparent';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  class Boom {
    booms = [];
    x;
    y;
    r;
    color;
    shape;
    boomArea;
    theta;
    dead;
    ba;

    constructor(x, r, color, boomArea, shape) {
      this.x = x;
      this.y = canvas.height + r;
      this.r = r;
      // console.log(this.x, this.y, this.r, boomArea)
      this.color = color;
      this.shape = shape || false;
      this.boomArea = boomArea;
      this.theta = 0;
      this.dead = false;
      this.ba = getRandom(80, 200);

      // playShotfire()
    }

    _move() {
      let dx = this.boomArea.x - this.x,
          dy = this.boomArea.y - this.y;
      this.x = this.x + dx * 0.01;
      this.y = this.y + dy * 0.01;
      // console.log(this.x, this.y, dx, this.ba)

      if (Math.abs(dx) <= this.ba && Math.abs(dy) <= this.ba) {
        this._boom();
        this.dead = true;
      } else {
        this._paint();
        this._drawLight();
      }
    }

    _paint() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    _drawLight() {
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
    }

    _boom() {
      let fireNum = getRandom(100, 300);
      let style = getRandom(0, 10) >= 5 ? 1 : 2;
      let color;
      if (style === 1) {
        color = {
          a: getRandom(128, 255),
          b: getRandom(128, 255),
          c: getRandom(128, 255),
        };
      }

      let fanwei = fireNum;
      // playBoom()

      for (let i = 0; i < fireNum; i++) {
        if (style === 2) {
          color = {
            a: getRandom(128, 255),
            b: getRandom(128, 255),
            c: getRandom(128, 255),
          };
        }
        let a = getRandom(-Math.PI, Math.PI);
        let x = getRandom(0, fanwei) * Math.cos(a) + this.x;
        let y = getRandom(0, fanwei) * Math.sin(a) + this.y;
        let radius = getRandom(0, 2);
        let frag = new Firework(this.x, this.y, radius, color, x, y);
        this.booms.push(frag);
      }
    }
  }

  class Firework {
    tx = 0;
    ty = 0;
    x = 0;
    y = 0;
    dead = false;
    centerX = 0;
    centerY = 0;
    radius = 0;
    color = 0;

    constructor(x, y, radius, color, tx, ty) {
      this.tx = tx;
      this.ty = ty;
      this.x = x;
      this.y = y;
      this.dead = false;
      this.centerX = x;
      this.centerY = y;
      this.radius = radius;
      this.color = color;
    }

    paint() {
      ctx.fillStyle = `rgba(${this.color.a},${this.color.b},${this.color.c})`;
      ctx.fillRect(
          this.x - this.radius,
          this.y - this.radius,
          this.radius * 2,
          this.radius * 2
      );
    }

    moveTo() {
      this.ty = this.ty + 0.3;
      let dx = this.tx - this.x,
          dy = this.ty - this.y;
      this.x = Math.abs(dx) < 0.1 ? this.tx : this.x + dx * 0.1;
      this.y = Math.abs(dy) < 0.1 ? this.ty : this.y + dy * 0.1;
      if (dx === 0 && Math.abs(dy) <= 80) {
        this.dead = true;
      }
      this.paint();
    }
  }

})

</script>

<style scoped lang="scss">

canvas {
  z-index: 99999;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  pointer-events: none;
}

</style>