<script setup lang="js">

import {onMounted} from "vue"
import {createWorker} from "tesseract.js";

onMounted(async () => {
  Array.prototype.clone = function () {
    return [].concat(this);
    //或者 return this.concat();
  }

  class Point {
    constructor(x, y, time) {
      this.x = x;
      this.y = y;
      this.isControl = false;
      this.time = Date.now();
      this.lineWidth = 0;
      this.isAdd = false;
    }
  }

  class Line {
    constructor() {
      this.points = new Array();
      this.changeWidthCount = 0;
      this.lineWidth = 10;
    }
  }

  class HandwritingSelf {

    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d")
      // this.points = new Array();
      this.line = new Line();
      this.pointLines = new Array();//Line数组
      this.k = 0.5;
      this.begin = null;
      this.middle = null;
      this.end = null;
      this.preTime = null;
      this.lineWidth = 8;
      this.isDown = false;
    }

    down(x, y) {
      this.isDown = true;
      this.line = new Line();
      this.line.lineWidth = this.lineWidth;
      let currentPoint = new Point(x, y, Date.now());
      this.addPoint(currentPoint);

      this.preTime = Date.now();
    }

    move(x, y) {
      // console.log("move:",x,y)
      if (this.isDown) {
        let currentPoint = new Point(x, y, Date.now())
        this.addPoint(currentPoint);
        this.draw();
      }
    }

    up(x, y) {
      // if (e.touches.length > 0) {
      let currentPoint = new Point(x, y, Date.now())
      this.addPoint(currentPoint);
      // }
      this.draw(true);

      this.pointLines.push(this.line);

      this.begin = null;
      this.middle = null;
      this.end = null;
      this.isDown = false;
    }

    draw(isUp = false) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.strokeStyle = "rgba(255,20,87,1)";


      //绘制不包含this.line的线条
      this.pointLines.forEach((line, index) => {
        let points = line.points;
        this.ctx.beginPath();
        this.ctx.ellipse(points[0].x - 1.5, points[0].y, 6, 3, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        let lastW = line.lineWidth;
        this.ctx.lineWidth = line.lineWidth;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        let minLineW = line.lineWidth / 4;
        let isChangeW = false;

        let changeWidthCount = line.changeWidthCount;
        for (let i = 1; i <= points.length; i++) {
          if (i == points.length) {
            this.ctx.stroke();
            break;
          }
          if (i > points.length - changeWidthCount) {
            if (!isChangeW) {
              this.ctx.stroke();//将之前的线条不变的path绘制完
              isChangeW = true;
              if (i > 1 && points[i - 1].isControl)
                continue;
            }
            let w = (lastW - minLineW) / changeWidthCount * (points.length - i) + minLineW;
            points[i - 1].lineWidth = w;
            this.ctx.beginPath();//为了开启新的路径 否则每次stroke 都会把之前的路径在描一遍
            // this.ctx.strokeStyle = "rgba("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+",1)";
            this.ctx.lineWidth = w;
            this.ctx.moveTo(points[i - 1].x, points[i - 1].y);//移动到之前的点
            this.ctx.lineTo(points[i].x, points[i].y);
            this.ctx.stroke();//将之前的线条不变的path绘制完
          } else {
            if (points[i].isControl && points[i + 1]) {
              this.ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            } else if (i >= 1 && points[i - 1].isControl) {//上一个是控制点 当前点已经被绘制
            } else
              this.ctx.lineTo(points[i].x, points[i].y);
          }
        }
      })

      //绘制this.line线条
      let points;
      if (isUp)
        points = this.line.points;
      else
        points = this.line.points.clone();
      //当前绘制的线条最后几个补点 贝塞尔方式增加点
      let count = 0;
      let insertCount = 0;
      let i = points.length - 1;
      let endPoint = points[i];
      let controlPoint;
      let startPoint;
      while (i >= 0) {
        if (points[i].isControl == true) {
          controlPoint = points[i];
          count++;
        } else {
          startPoint = points[i];
        }
        if (startPoint && controlPoint && endPoint) {//使用贝塞尔计算补点
          let dis = this.z_distance(startPoint, controlPoint) + this.z_distance(controlPoint, endPoint);
          let insertPoints = this.BezierCalculate([startPoint, controlPoint, endPoint], Math.floor(dis / 6) + 1);
          insertCount += insertPoints.length;
          var index = i;//插入位置
          // 把insertPoints 变成一个适合splice的数组（包含splice前2个参数的数组）
          insertPoints.unshift(index, 1);
          Array.prototype.splice.apply(points, insertPoints);

          //补完点后
          endPoint = startPoint;
          startPoint = null;
        }
        if (count >= 6)
          break;
        i--;
      }
      //确定最后线宽变化的点数
      let changeWidthCount = count + insertCount;
      if (isUp)
        this.line.changeWidthCount = changeWidthCount;

      //制造椭圆头
      this.ctx.fillStyle = "rgba(255,20,87,1)"
      this.ctx.beginPath();
      this.ctx.ellipse(points[0].x - 1.5, points[0].y, 6, 3, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      let lastW = this.line.lineWidth;
      this.ctx.lineWidth = this.line.lineWidth;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      let minLineW = this.line.lineWidth / 4;
      let isChangeW = false;
      for (let i = 1; i <= points.length; i++) {
        if (i == points.length) {
          this.ctx.stroke();
          break;
        }
        //最后的一些点线宽变细
        if (i > points.length - changeWidthCount) {
          if (!isChangeW) {
            this.ctx.stroke();//将之前的线条不变的path绘制完
            isChangeW = true;
            if (i > 1 && points[i - 1].isControl)
              continue;
          }

          //计算线宽
          let w = (lastW - minLineW) / changeWidthCount * (points.length - i) + minLineW;
          points[i - 1].lineWidth = w;
          this.ctx.beginPath();//为了开启新的路径 否则每次stroke 都会把之前的路径在描一遍
          // this.ctx.strokeStyle = "rgba(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ",0.5)";
          this.ctx.lineWidth = w;
          this.ctx.moveTo(points[i - 1].x, points[i - 1].y);//移动到之前的点
          this.ctx.lineTo(points[i].x, points[i].y);
          this.ctx.stroke();//将之前的线条不变的path绘制完
        } else {
          if (points[i].isControl && points[i + 1]) {
            this.ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
          } else if (i >= 1 && points[i - 1].isControl) {//上一个是控制点 当前点已经被绘制
          } else
            this.ctx.lineTo(points[i].x, points[i].y);
        }
      }
    }

    addPoint(p) {
      if (this.line.points.length >= 1) {
        let last_point = this.line.points[this.line.points.length - 1]
        let distance = this.z_distance(p, last_point);
        if (distance < 10) {
          return;
        }
      }

      if (this.line.points.length == 0) {
        this.begin = p;
        p.isControl = true;
        this.pushPoint(p);
      } else {
        this.middle = p;
        let controlPs = this.computeControlPoints(this.k, this.begin, this.middle, null);
        this.pushPoint(controlPs.first);
        this.pushPoint(p);
        p.isControl = true;

        this.begin = this.middle;
      }
    }

    pushPoint(p) {
      //排除重复点
      if (this.line.points.length >= 1 && this.line.points[this.line.points.length - 1].x == p.x && this.line.points[this.line.points.length - 1].y == p.y)
        return;
      this.line.points.push(p);
    }

    computeControlPoints(k, begin, middle, end) {
      if (k > 0.5 || k <= 0)
        return;

      let diff1 = new Point(middle.x - begin.x, middle.y - begin.y)
      let diff2 = null;
      if (end)
        diff2 = new Point(end.x - middle.x, end.y - middle.y)

      // let l1 = (diff1.x ** 2 + diff1.y ** 2) ** (1 / 2)
      // let l2 = (diff2.x ** 2 + diff2.y ** 2) ** (1 / 2)

      let first = new Point(middle.x - (k * diff1.x), middle.y - (k * diff1.y))
      let second = null;
      if (diff2)
        second = new Point(middle.x + (k * diff2.x), middle.y + (k * diff2.y))
      return {first: first, second: second}
    }

    z_distance(b, e) {
      return Math.sqrt(Math.pow(e.x - b.x, 2) + Math.pow(e.y - b.y, 2));
    }

    BezierCalculate(poss, precision) {

      //维度，坐标轴数（二维坐标，三维坐标...）
      let dimersion = 2;

      //贝塞尔曲线控制点数（阶数）
      let number = poss.length;

      //控制点数不小于 2 ，至少为二维坐标系
      if (number < 2 || dimersion < 2)
        return null;

      let result = new Array();

      //计算杨辉三角
      let mi = new Array();
      mi[0] = mi[1] = 1;
      for (let i = 3; i <= number; i++) {

        let t = new Array();
        for (let j = 0; j < i - 1; j++) {
          t[j] = mi[j];
        }

        mi[0] = mi[i - 1] = 1;
        for (let j = 0; j < i - 2; j++) {
          mi[j + 1] = t[j] + t[j + 1];
        }
      }

      //计算坐标点
      for (let i = 0; i < precision; i++) {
        let t = i / precision;
        let p = new Point(0, 0);
        p.isAdd = true;
        result.push(p);
        for (let j = 0; j < dimersion; j++) {
          let temp = 0.0;
          for (let k = 0; k < number; k++) {
            temp += Math.pow(1 - t, number - k - 1) * (j == 0 ? poss[k].x : poss[k].y) * Math.pow(t, k) * mi[k];
          }
          j == 0 ? p.x = temp : p.y = temp;
        }
      }

      return result;
    }

    clear() {
      this.line = new Line();
      this.pointLines = new Array();//Line数组
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }


  const worker = await createWorker({
    // logger: m => console.log(m)
  });
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
  });
  let lastTime = Date.now()
  let timer = -1
  let checkTime = 400


//以下代码为鼠标移动事件部分
  let handwriting = new HandwritingSelf(document.getElementById("canvasId"))
// document.ontouchstart = document.onmousedown
  document.onpointerdown = function (e) {
    if (Date.now() - lastTime > checkTime) {
      handwriting.clear()
    } else {
      clearTimeout(timer)
    }
    if (e.type == "touchstart")
      handwriting.down(e.touches[0].pageX, e.touches[0].pageY);
    else
      handwriting.down(e.x, e.y);
  }
// document.ontouchmove = document.onmousemove
  document.onpointermove = function (e) {
    if (e.type == "touchmove")
      handwriting.move(e.touches[0].pageX, e.touches[0].pageY);
    else
      handwriting.move(e.x, e.y);
  }

// document.ontouchend = document.onmouseup
  document.onpointerup = function (e) {
    if (e.type == "touchend")
      handwriting.up(e.touches[0].pageX, e.touches[0].pageY);
    else
      handwriting.up(e.x, e.y);

    clearTimeout(timer)
    timer = setTimeout(() => {
      console.log('识别');
      // handwriting.canvas.toDataURL()

      // var MIME_TYPE = "image/png";
      // var imgURL = handwriting.canvas.toDataURL(MIME_TYPE);
      // var dlLink = document.createElement('a');
      // dlLink.download = 'fileName.png';
      // dlLink.href = imgURL;
      // dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
      //
      // document.body.appendChild(dlLink);
      // dlLink.click();
      // document.body.removeChild(dlLink);

      (async () => {
        const {data: {text}} = await worker.recognize(handwriting.canvas);
        console.log(text);
      })();
    }, checkTime)

    lastTime = Date.now()
  }
})
</script>

<template>
  <div class="mobile">
    <canvas id="canvasId" width="800" height="720"></canvas>
  </div>
</template>

<style scoped lang="scss">
@import "assets/css/colors";

.mobile {
  background: $dark-main-bg;

  canvas {
    //width: 100%;
    //height: 100%;
    border: 1px solid gray;
  }
}

</style>