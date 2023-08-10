<template>
  <div id="background">
    <img src="@/assets/img/moon.png" alt="" id="moon" style="display:none">
    <canvas ref="canvas"/>
  </div>
</template>

<script setup lang="ts">

import {onMounted} from "vue"

const canvas = $ref()
let ctx = null

onMounted(() => {
  console.log('canvas;', canvas)
  // ctx = canvas.getContext('2d')
  let ocas = document.createElement("canvas");
  let octx = ocas.getContext("2d");
  let ctx = canvas.getContext("2d");
  ocas.width = canvas.width = window.innerWidth;
  ocas.height = canvas.height = window.innerHeight;
  let maxRadius = 1,
      stars = [];


  let Star = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  };
  Star.prototype = {
    paint: function () {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255," + this.r + ")";
      ctx.fill();
      ctx.restore();
    },
  };

  function drawBg() {
    for (let i = 0; i < 1000; i++) {
      let r = Math.random() * maxRadius;
      let x = Math.random() * canvas.width;
      let y = Math.random() * 2 * canvas.height - canvas.height;
      let star = new Star(x, y, r);
      stars.push(star);
      star.paint();
    }
  }

  drawBg()

  function drawMoon() {
    let moon = document.getElementById("moon");
    let centerX = canvas.width - 200,
        centerY = 100,
        width = 80;

    let index = 0;
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
          centerX + width / 2,
          centerY + width / 2,
          width / 2 + index,
          0,
          2 * Math.PI
      );
      ctx.fillStyle = "rgba(240,219,120,0.05)";
      index += 2;
      ctx.fill();
      ctx.restore();
    }
    if (moon.complete) {
      ctx.drawImage(moon, centerX, centerY, width, width);
    } else {
      moon.onload = function () {
        ctx.drawImage(moon, centerX, centerY, width, width);
      };
    }
  }

  drawMoon()
})

</script>

<style scoped lang="scss">
@import "@/assets/css/colors";

#background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background: $dark-main-bg;

  canvas {
    width: 100vw;
    height: 100vh;
  }
}


</style>