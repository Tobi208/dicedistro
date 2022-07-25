<template>
  <main>

    <div v-show="state === 'config'" class="config">

      <div class="top-box">
        <button @click="addDC()">Add Config</button>
        <button class="flex-break" @click="calculate()">Simulate Distribution</button>
        <div class="sample-size">
          <label for="sample-size">Sample Size</label>
          <input id="sample-size" v-model="sampleSize" type="text" @change="filterSampleSize()" />
        </div>
        <div class="val-range">Value Range [{{ minRoll }}, {{ maxRoll }}]</div>
      </div>

      <div v-for="(dc, index) in diceConfigs" :key="index" class="dice-config">

        <button v-show="diceConfigs.length > 1" class="x" @click="deleteDC(index)">X</button>

        <div class="polyhedrons flex-break">
          <div v-for="(d, index2) in dc.dice" :key="index2" class="polyhedron-wrapper">
                <label :class="{ glow: d.active }" ><input v-show="false" v-model="d.active" type="checkbox" @change="updateDC(index)" /><component :is="'d' + i2d[index2] + 'svg'" class="polyhedron"/></label>
          </div>
        </div>

        <div v-for="(d, index2) in dc.dice" v-show="d.active" :key="index2" class="dice-box">
          
          <div class="title flex-break">d{{ d.v }}</div>
          
          <div class="number-box roll">
            <div class="subtitle flex-break">Roll</div>
            <div class="plus-minus-box">
              <button class="plus" @click="incN(index, index2)">+</button>
              <button class="minus" @click="decN(index, index2)">&#8212;</button>
            </div>
            <input v-model="d.n" class="short-number flex-break" @change="filterN(index, index2)" />
            <div class="footer-toggle-box">
              <label :class="{ selected: !d.add, 'ftb-left': true}" ><input v-show="false" v-model="d.add" type="radio" :value="false" @change="updateDC(index)" />Sub</label>
              <label :class="{ selected: d.add, 'ftb-right': true}" ><input v-show="false" v-model="d.add" type="radio" :value="true" @change="updateDC(index)" />Add</label>
            </div>
          </div>

          <div class="number-box reroll flex-break">
            <div class="subtitle flex-break">Reroll</div>
            <div class="plus-minus-box">
              <button class="plus" @click="incRR(index, index2)">+</button>
              <button class="minus" @click="decRR(index, index2)">&#8212;</button>
            </div>
            <p>&#8804;</p>
            <input v-model="d.rr" type="text" class="short-number flex-break" @change="filterRR(index, index2)" />
            <div class="footer-toggle-box">
              <label :class="{ selected:  !d.rrO, 'ftb-left': true}" ><input v-show="false" v-model="d.rrO" type="radio" :value="false" @change="updateDC(index, index2)" />Always</label>
              <label :class="{ selected:  d.rrO, 'ftb-right': true}" ><input v-show="false" v-model="d.rrO" type="radio" :value="true" @change="updateDC(index, index2)" />Once</label>
            </div>
          </div>

          <div class="number-box drop">
            <div class="subtitle flex-break">Drop</div>
            <div class="plus-minus-box">
              <button class="plus" @click="incDL(index, index2)">+</button>
              <button class="minus" @click="decDL(index, index2)">&#8212;</button>
            </div>
            <input v-model="d.dl" type="text" class="short-number" @change="filterDL(index, index2)" />
          </div>

          <div class="number-box mod flex-break">
            <div class="subtitle flex-break">Modifier</div>
            <div class="plus-minus-box">
              <button class="plus" @click="incMod(index, index2)">+</button>
              <button class="minus" @click="decMod(index, index2)">&#8212;</button>
            </div>
            <input v-model="d.mod" type="text" class="short-number" @change="filterMod(index, index2)" />
          </div>

          <div class="advantage footer-toggle-box">
            <label :class="{ selected:  d.adv === 'disadv', 'ftb-left': true}" ><input v-show="false" v-model="d.adv" type="radio" value="disadv" @click="checkAdv(index, index2, 'disadv')" />Disadvantage</label>
            <label :class="{ selected:  d.adv === 'adv', 'ftb-right': true}" ><input v-show="false" v-model="d.adv" type="radio" value="adv" @click="checkAdv(index, index2, 'adv')" />Advantage</label>
          </div>

        </div>

      </div>

    </div>


    <div v-show="state === 'calc'">


    </div>


    <div v-show="state === 'graph'" class="graphs">
      <div v-for="(data, index) in graphData" :key="index" class="graph">
        <vue-bar-graph
          :points="data"
          :width="800"
          :height="200"
          :show-y-axis="true"
          :show-x-axis="true"
          :max-y-axis="maxY"
        />
      </div>
    </div>

  </main>
</template>

<script>
import VueBarGraph from '@/components/VueBarChart.vue'

import d4svg from '@/assets/svg/d4.svg'
import d6svg from '@/assets/svg/d6.svg'
import d8svg from '@/assets/svg/d8.svg'
import d10svg from '@/assets/svg/d10.svg'
import d12svg from '@/assets/svg/d12.svg'
import d20svg from '@/assets/svg/d20.svg'
import d100svg from '@/assets/svg/d100.svg'

export default {
  name: 'IndexPage',
  components: {
    VueBarGraph,
    d4svg, d6svg, d8svg, d10svg, d12svg, d20svg, d100svg,
  },
  data() {
    const baseDiceConfig = {
      dice: [
        { v:   4, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v:   6, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v:   8, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v:  10, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v:  12, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v:  20, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 100, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
      ], 
      minR: 0, maxR: 0,
    }
    return {
      state: 'config',
      sampleSize: 10000,
      minVal: 0,
      maxVal: 0,
      maxY: 0,
      baseDiceConfig,
      i2d: { 0: 4, 1: 6, 2: 8, 3: 10, 4: 12, 5: 20, 6: 100 },
      diceConfigs: [ JSON.parse(JSON.stringify(baseDiceConfig)) ],
      graphData: [],
    }
  },
  head() {
    return {
      title: 'Dice Distributions',
    }
  },
  computed: {
    minRoll() {
      if (this.diceConfigs.length === 0)
        return 0
      let min = Number.MAX_SAFE_INTEGER
      this.diceConfigs.forEach( dc => {
        min = min < dc.minR ? min : dc.minR
      })
      return min
    },
    maxRoll() {
      if (this.diceConfigs.length === 0)
        return 0
      let max = Number.MIN_SAFE_INTEGER
      this.diceConfigs.forEach( dc => {
        max = max > dc.maxR ? max : dc.maxR
      })
      return max

    },
  },
  methods: {

    // --- Control Bar ---

    filterSampleSize() {
      if (!this.sampleSize.toString().match(/\d+/g))
        this.sampleSize = 10000
    },

    addDC() {
      this.diceConfigs.push( JSON.parse(JSON.stringify(this.baseDiceConfig)) )
    },

    calculate() {

      // TODO DEV REROLLS DROP ADVANTAGE DISADVANTAGE SUB ADD FUCK YOU

      this.graphData = []

      // universal axis initial values
      const y = {}
      for (let i = this.minVal; i <= this.maxVal; i++)
        y[i] = 0

      let j = 0
      let v = 0
      let k = 0     
      let points = []
      let maxY = Number.MIN_SAFE_INTEGER

      // random values
      this.diceConfigs.forEach((dc, i) => {

        this.graphData.push({ ...y })
        
        for (k = 0; k < this.sampleSize; k++) {
          v = 0
          for (j = 0; j < dc.d4; j++)
            v += this.getRandInt(4)
          for (j = 0; j < dc.d6; j++)
            v += this.getRandInt(6)
          for (j = 0; j < dc.d8; j++)
            v += this.getRandInt(8)
          for (j = 0; j < dc.d10; j++)
            v += this.getRandInt(10)
          for (j = 0; j < dc.d12; j++)
            v += this.getRandInt(12)
          for (j = 0; j < dc.d20; j++)
            v += this.getRandInt(20)
          for (j = 0; j < dc.d100; j++)
            v += this.getRandInt(100)
          v += dc.mod
          this.graphData[i][v]++
        }

        points = []
        Object.entries(this.graphData[i]).forEach( (e) => {
          v = Math.round(e[1] / this.sampleSize * 10000) / 100
          maxY = maxY > v ? maxY : v
          points.push({ label: e[0], value: v })
        })
        this.graphData[i] = points
      })

      this.maxY = Math.ceil(maxY)
      this.state = 'graph'
    },


    // --- Dice Config ---

    deleteDC(i) {
      if (this.diceConfigs.length > 1) {
        this.diceConfigs.splice(i, 1)
      }
    },

    updateDC(i) {
      let sumMinR = 0
      let sumMaxR = 0
      let minR = 0
      let maxR = 0

      this.diceConfigs[i].dice.forEach(d => {
        if (!d.active || (d.n === 0 && d.mod === 0))
          return
        
        if (!d.rrO && d.rr > 0) {
          minR = (d.n - d.dl) * (d.rr + 1)
        } else {
          minR = d.n - d.dl
        }
        maxR = (d.n - d.dl) * d.v

        if (d.add) {
          sumMinR += minR + d.mod
          sumMaxR += maxR + d.mod
        } else {
          sumMinR -= maxR + d.mod
          sumMaxR -= minR + d.mod
        }
        
      })

      this.diceConfigs[i].minR = sumMinR
      this.diceConfigs[i].maxR = sumMaxR
    },


    // enforce max Rerolls and Drops

    updateD(i, j) {        
      const mDL = this.maxDL(i, j)
      if (this.diceConfigs[i].dice[j].n > mDL)
        this.diceConfigs[i].dice[j].dl = mDL
    },


    // number of rolls

    incN(i, j) {
      if (this.diceConfigs[i].dice[j].n < 99) {
        this.diceConfigs[i].dice[j].n++
        this.updateDC(i)
      }
    },
    decN(i, j) {
      if (this.diceConfigs[i].dice[j].n > 0) {
        this.diceConfigs[i].dice[j].n--
        this.updateDC(i)
        this.updateD(i, j)
      }
    },
    filterN(i, j) {
      const n = this.diceConfigs[i].dice[j].v
      if (!n.toString().match(/^\d+$/g)) {
        this.diceConfigs[i].dice[j].n = 0
      } else {
        if (n > 99) {
          this.diceConfigs[i].dice[j].n = 99
        } else if (n < 0) {
          this.diceConfigs[i].dice[j].n = 0
        }
        this.updateDC(i)
        this.updateD(i, j)
      }
    },

    // reroll rolls lower than

    incRR(i, j) {
      const mRR = this.maxRR(i, j)
      if (this.diceConfigs[i].dice[j].rr < mRR) {
        this.diceConfigs[i].dice[j].rr++
        if (!this.diceConfigs[i].dice[j].rrO) {
          this.updateDC(i)
        }
      }
    },
    decRR(i, j) {
      if (this.diceConfigs[i].dice[j].rr > 0) {
        this.diceConfigs[i].dice[j].rr--
        this.updateDC(i)
      }
    },
    filterRR(i, j) {
      const rr = this.diceConfigs[i].dice[j].rr
      if (!rr.toString().match(/^\d+$/g)) {
        this.diceConfigs[i].dice[j].rr = 0
      } else {
        const mRR = this.maxRR(i, j)
        if (rr > mRR) {
          this.diceConfigs[i].dice[j].rr = mRR
        } else if (rr < 0) {
          this.diceConfigs[i].dice[j].rr = 0
        }
        this.updateDC(i)
      }
    },
    maxRR(i, j) {
      return this.diceConfigs[i].dice[j].v - 1
    },


    // drop number of lowest rolls

    incDL(i, j) {
      const mDL = this.maxDL(i, j)
      if (this.diceConfigs[i].dice[j].dl < mDL) {
        this.diceConfigs[i].dice[j].dl++
        this.updateDC(i)
      }
    },
    decDL(i, j) {
      if (this.diceConfigs[i].dice[j].dl > 0) {
        this.diceConfigs[i].dice[j].dl--
        this.updateDC(i)
      }
    },
    filterDL(i, j) {
      const dl = this.diceConfigs[i].dice[j].dl
      if (!dl.toString().match(/^\d+$/g)) {
        this.diceConfigs[i].dice[j].dl = 0
      } else {
        const mDL = this.maxDL(i, j)
        if (this.diceConfigs[i].dice[j].n > mDL) {
          this.diceConfigs[i].dice[j].dl = mDL
        } else if (dl < 0) {
          this.diceConfigs[i].dice[j].dl = 0
        }
        this.updateDC(i)
      }
    },
    maxDL(i, j) {
      return this.diceConfigs[i].dice[j].n > 0 ? this.diceConfigs[i].dice[j].n - 1 : 0
    },


    // modifier number

    incMod(i, j) {
      if (this.diceConfigs[i].dice[j].mod < 99) {
        this.diceConfigs[i].dice[j].mod++
        this.updateDC(i)
      }
    },
    decMod(i, j) {
      if (this.diceConfigs[i].dice[j].mod > -99) {
        this.diceConfigs[i].dice[j].mod--
        this.updateDC(i)
      }
    },
    filterMod(i, j) {
      const mod = this.diceConfigs[i].dice[j].mod
      if (!mod.toString().match(/^-?\d+$/g)) {
        this.diceConfigs[i].dice[j].mod = 0
      } else {
        if (mod > 99) {
          this.diceConfigs[i].dice[j].mod = 99
        } else if (mod < -99) {
          this.diceConfigs[i].dice[j].mod = -99
        }
        this.updateDC(i)
      }
    },


    // check uncheck advantage

    checkAdv(i, j, v) {
      this.diceConfigs[i].dice[j].adv = v === this.diceConfigs[i].dice[j].prevAdv ? '' : v
      this.diceConfigs[i].dice[j].prevAdv = this.diceConfigs[i].dice[j].adv
    },


    // --- Utility ---

    getRandInt(max) {
      return Math.floor(Math.random() * max) + 1
    },

  },
}
</script>

<style lang="sass">

$main-border-color: darkgrey
$main-background-color: lightgrey

$main-accent-color-light: #ffbffb

@mixin flex-col-layout($gap-size: 15px)
  display: flex
  flex-direction: column
  align-items: center
  gap: $gap-size

@mixin flex-row-layout($justify: space-evenly, $gap-size: 15px)
  display: flex
  flex-direction: row
  justify-content: $justify
  gap: $gap-size

*
  font-family: Arial, Helvetica, sans-serif
  box-sizing: border-box

main
  width: 95%
  @include flex-col-layout
  padding-bottom: 25px

.flex-break
  page-break-after: always
  break-after: always

.config
  @include flex-col-layout
  width: 100%

.top-box
  @include flex-row-layout
  flex-wrap: wrap
  align-items: center

  .sample-size input
    text-align: center
    padding: 3px
    border-radius: 5px
    border: 1px solid $main-border-color
    max-width: 100px

  .min-val input, .max-val input
    text-align: center
    padding: 3px
    border-radius: 5px
    border: 1px solid $main-border-color
    max-width: 100px

.dice-config
  width: 100%
  position: relative
  @include flex-row-layout($justify: center)
  flex-wrap: wrap
  padding: 10px
  border: 1px solid $main-border-color
  border-radius: 25px

  .selected
    background-color: $main-background-color

  .x
    position: absolute
    top: 10px
    right: 10px
    width: 20px
    height: 20px
    border: 1px solid $main-border-color
    border-radius: 50%
    text-align: center
    font-size: small
    font-family: monospace

  .polyhedrons
    @include flex-row-layout
    width: 100%
    
    .polyhedron
      max-width: 32px
      max-height: 32px

    .glow *
      fill: $main-accent-color-light

  .dice-box
    @include flex-row-layout($justify: center)
    flex-wrap: wrap
    padding: 10px
    border: 1px solid $main-border-color
    border-radius: 15px
    max-width: 210px

    .title
      font-weight: bold
      text-align: center

    .subtitle
      text-align: center

    .number-box
      min-width: 85px
      max-width: 85px
      min-height: 85px
      max-height: 85px
      @include flex-row-layout($gap-size: 1px, $justify: center)
      flex-wrap: wrap
      align-items: center

      .plus-minus-box 
        display: flex
        flex-direction: column
        align-items: center

      .minus, .plus
        font-size: large
        font-family: monospace
        padding: 5px
        width: 25px
        height: 25px
        border: none

      .minus
        border-radius: 0 0 50% 50%

      .plus
        border-radius: 50% 50% 0 0

      input.short-number
        width: 40px
        height: 40px
        text-align: center
        border-radius: 50%
        border: 1px solid $main-border-color

      .ftb-left, .ftb-right
        width: 35px
        font-size: small

    .reroll
      gap: 2px
      min-width: 85px
      max-width: 85px

      .ftb-left, .ftb-right
        width: 42px

      input.short-number
        border: none
        border-bottom: 1px solid $main-border-color
        border-radius: 0
        height: 20px
        width: 30px

    .footer-toggle-box
      display: flex
      justify-content: center
      gap: 0

      .ftb-left, .ftb-right
        border: 1px solid $main-border-color
        padding: 1px
        text-align: center
        font-family: monospace
      
      .ftb-right
        border-radius: 0 5px 5px 0
        border-left: none

      .ftb-left
        border-radius: 5px 0 0 5px
        border-right: none
    
    .advantage
      
      .ftb-left, .ftb-right
        width: 95px

      .ftb-right
        border-left: 1px solid $main-border-color

.graphs
  @inlcude flex-col-layout

.graph
  padding: 15px
  @include flex-row-layout


</style>
