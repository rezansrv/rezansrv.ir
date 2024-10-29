<template>
  <div>
    <svg id="svg">
    <text
  x="50%"
  y="50%"
  font-size="150"
  text-anchor="middle"
  fill="white"
  @mouseover="handleMouseOver"
  @mouseout="handleMouseOut"
  class="text-glitch"
>
  {{ displayText }}
</text>
    </svg>
  </div>
</template>
<script>

export default {
  data() {
    return {
      svg: null,
      dotMatrix: document.createElementNS("http://www.w3.org/2000/svg", 'circle'),
      dots: [],
      lineMatrix: document.createElementNS("http://www.w3.org/2000/svg", 'line'),
      dotNumber: 207,
      lineNumber: 6,
      screenW: 0,
      screenH: 0,
      dotColumns: 0,
      dotRows: 0,
      dotRandomMax: 2,
      isInitialized: false,
      mouseMoving: false,
      mouse: {
        distances: [],
        power:13,
        X: 0,
        Y: 0,
      },
      displayText: 'I make things', // افزودن متغیر برای نمایش متن
    };
  },

  mounted() {
    this.svg = document.getElementById('svg');
    this.init();
    this.animate();
    
    this.setStyles(); // Add this line
    //********************************************************************** */
    // window.addEventListener('resize', () => {
    //   this.destroy();
    //   this.init();
      
    // });
    this.svg.addEventListener('mousemove', (e) => {
  const svgRect = this.svg.getBoundingClientRect();
  this.mouseMoving = true;
  this.mouse.X = e.clientX - svgRect.left; // مختصات X نسبت به SVG
  this.mouse.Y = e.clientY - svgRect.top; // مختصات Y نسبت به SVG
});
  },
  methods: {
    //mouse hover
    changeText(newText) {
      this.displayText = newText;},

      handleMouseOver() {
      this.mouse.power = 80;
      this.changeText('I break things');
    },
    handleMouseOut() {
      this.mouse.power = 13;
      this.changeText('I make things');
    },

      setStyles() {
        
    const circles = this.svg.querySelectorAll('circle');
    const lines = this.svg.querySelectorAll('line');


    lines.forEach(line => {
    line.setAttribute('stroke', 'white');
  });
    circles.forEach(circle => {
      circle.setAttribute('fill', 'white');
    })
  },

    animate() {
      this.moveDots();
      this.mouseInteraction();
      requestAnimationFrame(this.animate);
    },
    init() {
      this.screenW = window.innerWidth;
      this.screenH = 620;
            // Check if the screen width is less than a certain threshold (e.g., 600 pixels)
  if (window.innerWidth < 600) {
    this.dotNumber = 160; // Set the desired number of dots for mobile size
  } else {
    this.dotNumber = 207; // Set the default number of dots for larger screens
  }
  if (window.innerWidth < 600) {
    this.lineNumber = 5; // Set the desired number of dots for mobile size
  } else {
    this.lineNumber = 6; // Set the default number of dots for larger screens
  }
      this.dotRows = Math.sqrt(this.dotNumber * (this.screenH / this.screenW));
      this.dotColumns = this.dotNumber / this.dotRows;
      var dotPosStepX = Math.round(this.screenW / this.dotColumns);
      var dotPosStepY = Math.round(this.screenH / this.dotRows);
      this.dotRows = Math.round(this.dotRows);
      this.dotColumns = Math.round(this.dotColumns);
  //     const fixedHeight = 600; // Change this value to your desired height
  // this.svg.setAttribute('height', fixedHeight);
      this.svg.setAttribute('height', this.screenH);
      for (let i = 0, j = 0, k = 0; i < this.dotNumber; i++, k++) {
        if (i % this.dotColumns === 0) {
          j++;
          k = 0;
        }
        this.dots[i] = {};
        this.dots[i].distances = [];
        this.dots[i].el = this.dotMatrix.cloneNode(false);
        this.dots[i].X = k * dotPosStepX + dotPosStepX / 2;
        this.dots[i].X += Math.floor((Math.random() * this.dotRandomMax) + 1 - this.dotRandomMax / 2);
        this.dots[i].Y = j * dotPosStepY - dotPosStepY / 2;
        this.dots[i].Y += Math.floor((Math.random() * this.dotRandomMax) + 1 - this.dotRandomMax / 2);
        this.dots[i].r = 1;
        this.dots[i].lines = [];
        this.dots[i].el.setAttribute('cx', this.dots[i].X);
        this.dots[i].el.setAttribute('cy', this.dots[i].Y);
        this.dots[i].el.setAttribute('r', this.dots[i].r);
        this.svg.appendChild(this.dots[i].el);
        for (let l = 0; l < this.lineNumber; l++) {
          this.dots[i].lines[l] = {};
          this.dots[i].lines[l].el = this.lineMatrix.cloneNode(false);
          this.dots[i].lines[l].X1 = this.dots[i].X;
          this.dots[i].lines[l].Y1 = this.dots[i].Y;
          this.dots[i].lines[l].X2 = this.dots[i].X;
          this.dots[i].lines[l].Y2 = this.dots[i].Y;
          this.dots[i].lines[l].el.setAttribute('stroke', 'rgba(0,255,255,0.00)');
          this.dots[i].lines[l].el.setAttribute('stroke-width', '1');
          this.svg.appendChild(this.dots[i].lines[l].el);
        }
      }
    },
    destroy() {
      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }
      this.dots.length = 0;
    },
    dotUpdate() {
      for (let i = 0; i < this.dotNumber; i++) {
        this.dots[i].el.setAttribute('cx', this.dots[i].X);
        this.dots[i].el.setAttribute('cy', this.dots[i].Y);
        this.dots[i].el.setAttribute('r', this.dots[i].r);
        for (let l = 0; l < this.lineNumber; l++) {
          this.dots[i].lines[l].el.setAttribute('x1', this.dots[i].lines[l].X1);
          this.dots[i].lines[l].el.setAttribute('y1', this.dots[i].lines[l].Y1);
          this.dots[i].lines[l].el.setAttribute('x2', this.dots[i].lines[l].X2);
          this.dots[i].lines[l].el.setAttribute('y2', this.dots[i].lines[l].Y2);
        }
      }
    },
    getDistance(obj1, obj2) {
      return Math.floor(Math.sqrt(Math.pow((obj1.X - obj2.X), 2) + Math.pow((obj1.Y - obj2.Y), 2)));
    },
    moveDots() {
      for (let i = 0; i < this.dotNumber; i++) {
        this.dots[i].X += Math.floor((Math.random() * 5) - 2);
        this.dots[i].Y += Math.floor((Math.random() * 5) - 2);
        // Add boundary checks to keep dots within the screen
        this.dots[i].X = Math.max(0, Math.min(this.screenW, this.dots[i].X));
        this.dots[i].Y = Math.max(0, Math.min(this.screenH, this.dots[i].Y));

        for (let j = 0; j < this.dotNumber; j++) {
          this.dots[i].distances[j] = [j, this.getDistance(this.dots[i], this.dots[j])];
        }
        this.dots[i].distances = this.dots[i].distances.sort(this.Comparator);
        for (let k = 0; k < this.lineNumber; k++) {
          this.dots[i].lines[k].X1 = this.dots[i].X;
          this.dots[i].lines[k].Y1 = this.dots[i].Y;
          this.dots[i].lines[k].X2 = this.dots[this.dots[i].distances[k][0]].X;
          this.dots[i].lines[k].Y2 = this.dots[this.dots[i].distances[k][0]].Y;
        }
      }
      this.dotUpdate();
    },
    mouseInteraction() {
      if (this.mouseMoving) {
        for (let i = 0; i < this.dotNumber; i++) {
          this.dots[i].r = 1;
          this.mouse.distances[i] = [i, this.getDistance(this.mouse, this.dots[i])];
        }
        this.mouse.distances = this.mouse.distances.sort(this.Comparator);

        for (let j = 0; j < this.mouse.power && j < this.mouse.distances.length; j++) {
          let maxDist = this.mouse.distances[this.mouse.power - 1][1];
          let thisDist = this.mouse.distances[j][1];
          this.dots[this.mouse.distances[j][0]].r = 2;

          if (this.mouse.X >= this.dots[this.mouse.distances[j][0]].X) {
            this.dots[this.mouse.distances[j][0]].X -= (maxDist - thisDist) / 15;
          } else {
            this.dots[this.mouse.distances[j][0]].X += (maxDist - thisDist) / 15;
          }
          if (this.mouse.Y >= this.dots[this.mouse.distances[j][0]].Y) {
            this.dots[this.mouse.distances[j][0]].Y -= (maxDist - thisDist) / 15;
          } else {
            this.dots[this.mouse.distances[j][0]].Y += (maxDist - thisDist) / 15;
          }
        }
        this.mouseMoving = false;
      }
    },
    Comparator(a, b) {
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
      return 0;
    },
  },
};
</script>


<style scoped>

svg, html, body {
  box-sizing: border-box;
  height: 50%;
  width: 100%;
  padding: 0;
  margin: 0;
  background: #111827 ;
}

svg circle {
  position: relative;
  z-index: 0;
}

svg line {
  position: relative;
  z-index: 0;
}

.text-glitch {
  text-transform: uppercase;
  font-size:11.5vw;
  cursor: pointer;
  position: relative;
  z-index: 1000;
  text-align: center;
  font-family: Gotham XNarrow A, Gotham XNarrow B, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
  font-weight: bold; /* Changed from 400 to bold */
  font-style: normal;
  color: white;
  animation: glitch 2s steps(100) infinite;
}
@keyframes glitch {
  0% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  1% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  2% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  3% {
    text-shadow: 4px 0 0 red, -4px 0 0 blue;
  }
  4% {
    text-shadow: 5px 0 0 red, -5px 0 0 blue;
  }
  5% {
    text-shadow: 4px 0 0 red, -4px 0 0 blue;
  }
  6% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  7% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  8% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  9% {
    text-shadow: 0px 0 0 red, 0px 0 0 blue;
  }
  10% {
    text-shadow: -1px 0 0 red, 1px 0 0 blue;
  }
  11% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 lime;
  }
  12% {
    text-shadow: 1px 0 0 red, -1px 0 0 lime;
  }
  13% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 lime;
  }
  14% {
    text-shadow: 2px 0 0 red, -2px 0 0 lime;
  }
  15% {
    text-shadow: 2.5px 0 0 red, -2.5px 0 0 lime;
  }
  16% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 lime;
  }
  17% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 lime;
  }
  18% {
    text-shadow: -0.5px 0 0 red, 0.5px 0 0 lime;
  }
  19% {
    text-shadow: -1.5px 0 0 red, 1.5px 0 0 lime;
  }
  20% {
    text-shadow: -2.5px 0 0 red, 2.5px 0 0 lime;
  }
  21% {
    text-shadow: 0.7px 0 0 blue, -0.7px 0 0 lime;
  }
  22% {
    text-shadow: 1.4px 0 0 blue, -1.4px 0 0 lime;
  }
  23% {
    text-shadow: 2.1px 0 0 blue, -2.1px 0 0 lime;
  }
  24% {
    text-shadow: 2.8px 0 0 blue, -2.8px 0 0 lime;
  }
  25% {
    text-shadow: 3.5px 0 0 blue, -3.5px 0 0 lime;
  }
  26% {
    text-shadow: 4.2px 0 0 blue, -4.2px 0 0 lime;
  }
  27% {
    text-shadow: 4.9px 0 0 blue, -4.9px 0 0 lime;
  }
  28% {
    text-shadow: 5.6px 0 0 blue, -5.6px 0 0 lime;
  }
  29% {
    text-shadow: 6.3px 0 0 blue, -6.3px 0 0 lime;
  }
  30% {
    text-shadow: 7px 0 0 blue, -7px 0 0 lime;
  }
  31% {
    text-shadow: 6px 0 0 blue, -6px 0 0 lime;
  }
  32% {
    text-shadow: 5px 0 0 blue, -5px 0 0 lime;
  }
  33% {
    text-shadow: 4px 0 0 blue, -4px 0 0 lime;
  }
  34% {
    text-shadow: 3px 0 0 blue, -3px 0 0 lime;
  }
  35% {
    text-shadow: 2px 0 0 blue, -2px 0 0 lime;
  }
  36% {
    text-shadow: 1px 0 0 blue, -1px 0 0 lime;
  }
  37% {
    text-shadow: 0px 0 0 blue, 0px 0 0 lime;
  }
  38% {
    text-shadow: -1px 0 0 blue, 1px 0 0 lime;
  }
  39% {
    text-shadow: -2px 0 0 blue, 2px 0 0 lime;
  }
  40% {
    text-shadow: -3px 0 0 blue, 3px 0 0 lime;
  }
  41% {
    text-shadow: 50px 0 0 blue, -50px 0 0 lime;
  }
  42% {
    text-shadow: 0 0 0 blue, 0 0 0 lime;
  }
  43% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 lime;
  }
  44% {
    text-shadow: 1px 0 0 red, -1px 0 0 lime;
  }
  45% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 lime;
  }
  46% {
    text-shadow: 2px 0 0 red, -2px 0 0 lime;
  }
  47% {
    text-shadow: 1px 0 0 red, -1px 0 0 lime;
  }
  48% {
    text-shadow: 0px 0 0 red, 0px 0 0 lime;
  }
  49% {
    text-shadow: -1px 0 0 red, 1px 0 0 lime;
  }
  50% {
    text-shadow: -2px 0 0 red, 2px 0 0 lime;
  }
  51% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  52% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  53% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  54% {
    text-shadow: 4px 0 0 red, -4px 0 0 blue;
  }
  55% {
    text-shadow: 5px 0 0 red, -5px 0 0 blue;
  }
  56% {
    text-shadow: 4px 0 0 red, -4px 0 0 blue;
  }
  57% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  58% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  59% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  60% {
    text-shadow: 0px 0 0 red, 0px 0 0 blue;
  }
  61% {
    text-shadow: 30px 0 0 red, -30px 0 0 lime;
  }
  62% {
    text-shadow: 0 0 0 red, 0 0 0 lime;
  }
  63% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 blue;
  }
  64% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  65% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 blue;
  }
  66% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  67% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  68% {
    text-shadow: 0px 0 0 red, 0px 0 0 blue;
  }
  69% {
    text-shadow: -1px 0 0 red, 1px 0 0 blue;
  }
  70% {
    text-shadow: -2px 0 0 red, 2px 0 0 blue;
  }
  71% {
    text-shadow: 70px 0 0 red, -70px 0 0 blue;
  }
  72% {
    text-shadow: 0 0 0 red, 0 0 0 blue;
  }
  73% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  74% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  75% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  76% {
    text-shadow: 4px 0 0 red, -4px 0 0 blue;
  }
  77% {
    text-shadow: 3px 0 0 red, -3px 0 0 blue;
  }
  78% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
  }
  79% {
    text-shadow: 1px 0 0 red, -1px 0 0 blue;
  }
  80% {
    text-shadow: 0px 0 0 red, 0px 0 0 blue;
  }
  81% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 lime;
  }
  82% {
    text-shadow: 1px 0 0 red, -1px 0 0 lime;
  }
  83% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 lime;
  }
  84% {
    text-shadow: 2px 0 0 red, -2px 0 0 lime;
  }
  85% {
    text-shadow: 2.5px 0 0 red, -2.5px 0 0 lime;
  }
  86% {
    text-shadow: 1.5px 0 0 red, -1.5px 0 0 lime;
  }
  87% {
    text-shadow: 0.5px 0 0 red, -0.5px 0 0 lime;
  }
  88% {
    text-shadow: -0.5px 0 0 red, 0.5px 0 0 lime;
  }
  89% {
    text-shadow: -1.5px 0 0 red, 1.5px 0 0 lime;
  }
  90% {
    text-shadow: -2.5px 0 0 red, 2.5px 0 0 lime;
  }
  91% {
    text-shadow: 60px 0 0 lime, -60px 0 0 blue;
  }
  92% {
    text-shadow: 0 0 0 lime, 0 0 0 blue;
  }
  92% {
    text-shadow: 0.7px 0 0 blue, -0.7px 0 0 lime;
  }
  93% {
    text-shadow: 1.4px 0 0 blue, -1.4px 0 0 lime;
  }
  94% {
    text-shadow: 2.1px 0 0 blue, -2.1px 0 0 lime;
  }
  95% {
    text-shadow: 2.8px 0 0 blue, -2.8px 0 0 lime;
  }
  96% {
    text-shadow: 1.8px 0 0 blue, -1.8px 0 0 lime;
  }
  97% {
    text-shadow: 0.8px 0 0 blue, -0.8px 0 0 lime;
  }
  98% {
    text-shadow: -0.2px 0 0 blue, 0.2px 0 0 lime;
  }
  99% {
    text-shadow: -1.2px 0 0 blue, 1.2px 0 0 lime;
  }
  100% {
    text-shadow: -2.2px 0 0 blue, 2.2px 0 0 lime;
  }
}

</style>