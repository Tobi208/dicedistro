<template>
  <main>

    <div ref="config" :class="{config: true, shrink: shrink, grow: grow}">

      <div class="top-box">
        <button @click="addDC()">Add Dice Config</button>
        <div class="sample-size">
          <label for="sample-size">Sample Size</label>
          <input id="sample-size" v-model="sampleSize" type="text" @change="filterSampleSize()" />
        </div>
        <button class="flex-break" @click="calculate()">Simulate Distribution</button>
      </div>

      <div v-for="(dc, index) in diceConfigs" :key="'dc' + index" class="dice-config">

        <button v-show="diceConfigs.length > 1" class="x" @click="deleteDC(index)">X</button>

        <div v-if="dc.title" class="flex-break" style="font-size: x-large; padding: 5px 10px; margin-bottom: 5px; border-bottom: 1px solid lightgrey; width: 100%">
          {{ dc.title }}
        </div>

        <div class="polyhedrons flex-break">
          <div v-for="(d, index2) in dc.dice" :key="'poly' + index + '' + index2" @click="toggleDiceLabel(d, index)">
              <component :is="'d' + i2d[index2] + 'svg'" :class="{polyhedron: true, glow: d.active}"/>
          </div>
        </div>

        <div v-for="(d, index2) in dc.dice" v-show="d.active" :key="'d' + index + '' + index2" class="dice-box">

          <div class="title flex-break">d{{ d.v }}</div>

          <div class="number-box roll">
            <div class="subtitle flex-break">Roll</div>
            <div class="plus-minus-box">
              <button class="plus" @click="incN(index, index2)">+</button>
              <button class="minus" @click="decN(index, index2)">&#8212;</button>
            </div>
            <input v-model="d.n" class="short-number flex-break" @change="filterN(index, index2)" />
            <div class="footer-toggle-box">
              <label :class="{ selected: !d.add, 'ftb-left': true }"><input v-show="false" v-model="d.add" type="radio" :value="false" @change="updateDC(index)" />Sub</label>
              <label :class="{ selected: d.add, 'ftb-right': true }"><input v-show="false" v-model="d.add" type="radio" :value="true" @change="updateDC(index)" />Add</label>
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
              <label :class="{ selected: !d.rrO, 'ftb-left': true }"><input v-show="false" v-model="d.rrO" type="radio" :value="false" @change="updateDC(index, index2)" />Always</label>
              <label :class="{ selected: d.rrO, 'ftb-right': true }"><input v-show="false" v-model="d.rrO" type="radio" :value="true" @change="updateDC(index, index2)" />Once</label>
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

          <div class="advantage footer-toggle-box flex-break">
            <label :class="{ selected: d.adv === 'disadv', 'ftb-left': true }"><input v-show="false" v-model="d.adv" type="radio" value="disadv" @click="checkAdv(index, index2, 'disadv')" />Disadvantage</label>
            <label :class="{ selected: d.adv === 'adv', 'ftb-right': true }"><input v-show="false" v-model="d.adv" type="radio" value="adv" @click="checkAdv(index, index2, 'adv')" />Advantage</label>
          </div>

        </div>

        <div v-if="index < graphData.length" :key="'graph' + index + '' + graphKey" class="graph" >
          <vue-bar-graph
            :points="graphData[index]"
            :width="graphWidth"
            :height="200"
            :show-y-axis="true"
            :show-x-axis="true"
            bar-color="rgb(180, 120, 240)"
            :max-y-axis="maxY"
            :ease-in="false"
          />
        </div>

      </div>

    </div>


    <div :class="{'rolling-message': true, calculating: calculating}">
      <p>Rolling all of the math rocks!</p>
    </div>

  </main>
</template>

<script>
import VueBarGraph from '@/components/VueBarChart.vue'

import d4svg from '@/components/svg/d4.vue'
import d6svg from '@/components/svg/d6.vue'
import d8svg from '@/components/svg/d8.vue'
import d10svg from '@/components/svg/d10.vue'
import d12svg from '@/components/svg/d12.vue'
import d20svg from '@/components/svg/d20.vue'
import d100svg from '@/components/svg/d100.vue'

export default {
  name: 'AbilityScoresPage',
  components: {
    VueBarGraph,
    d4svg, d6svg, d8svg, d10svg, d12svg, d20svg, d100svg,
  },
  data() {
    const baseDiceConfig = {
      dice: [
        { v: 4, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 6, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 8, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 10, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 12, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 20, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
        { v: 100, n: 0, add: true, rr: 0, rrO: true, adv: '', prevAdv: '', dl: 0, mod: 0, active: false },
      ],
      minR: 0, maxR: 0,
    }
    return {
      shrink: false,
      grow: false,
      calculating: false,
      sampleSize: 1000000,
      maxY: 16,
      baseDiceConfig,
      i2d: { 0: 4, 1: 6, 2: 8, 3: 10, 4: 12, 5: 20, 6: 100 },
      diceConfigs: [{"title":"Roll Ability Scores with 3d6","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":3,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":3,"maxR":18},{"title":"Roll Ability Scores with 3d6, Reroll 1s Once","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":3,"add":true,"rr":1,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":3,"maxR":18},{"title":"Roll Ability Scores with 3d6, Reroll 1s Always","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":3,"add":true,"rr":1,"rrO":false,"adv":"","prevAdv":"","dl":0,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":6,"maxR":18},{"title":"Roll Ability Scores with 4d6, Drop Lowest","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":4,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":1,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":3,"maxR":18},{"title":"Roll Ability Scores with 4d6, Reroll 1s Once, Drop Lowest","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":4,"add":true,"rr":1,"rrO":true,"adv":"","prevAdv":"","dl":1,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":3,"maxR":18},{"title":"Roll Ability Scores with 4d6, Reroll 1s Always, Drop Lowest","dice":[{"v":4,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":6,"n":4,"add":true,"rr":1,"rrO":false,"adv":"","prevAdv":"","dl":1,"mod":0,"active":true},{"v":8,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":10,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":12,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":20,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false},{"v":100,"n":0,"add":true,"rr":0,"rrO":true,"adv":"","prevAdv":"","dl":0,"mod":0,"active":false}],"minR":6,"maxR":18}],
      graphData: [[{"label":3,"value":0.47},{"label":4,"value":1.39},{"label":5,"value":2.79},{"label":6,"value":4.62},{"label":7,"value":6.94},{"label":8,"value":9.7},{"label":9,"value":11.54},{"label":10,"value":12.51},{"label":11,"value":12.49},{"label":12,"value":11.63},{"label":13,"value":9.77},{"label":14,"value":6.9},{"label":15,"value":4.63},{"label":16,"value":2.78},{"label":17,"value":1.37},{"label":18,"value":0.46}],[{"label":3,"value":0},{"label":4,"value":0.05},{"label":5,"value":0.36},{"label":6,"value":1.42},{"label":7,"value":3.21},{"label":8,"value":5.7},{"label":9,"value":8.95},{"label":10,"value":12.31},{"label":11,"value":14.2},{"label":12,"value":14.54},{"label":13,"value":13.56},{"label":14,"value":10.99},{"label":15,"value":7.35},{"label":16,"value":4.42},{"label":17,"value":2.2},{"label":18,"value":0.73}],[{"label":3,"value":0},{"label":4,"value":0},{"label":5,"value":0},{"label":6,"value":0.79},{"label":7,"value":2.38},{"label":8,"value":4.78},{"label":9,"value":7.99},{"label":10,"value":11.95},{"label":11,"value":14.43},{"label":12,"value":15.27},{"label":13,"value":14.41},{"label":14,"value":12.02},{"label":15,"value":7.97},{"label":16,"value":4.8},{"label":17,"value":2.41},{"label":18,"value":0.8}],[{"label":3,"value":0.08},{"label":4,"value":0.3},{"label":5,"value":0.85},{"label":6,"value":1.93},{"label":7,"value":3.47},{"label":8,"value":5.83},{"label":9,"value":8.34},{"label":10,"value":10.65},{"label":11,"value":12.34},{"label":12,"value":13.37},{"label":13,"value":12.84},{"label":14,"value":10.89},{"label":15,"value":8.4},{"label":16,"value":5.88},{"label":17,"value":3.24},{"label":18,"value":1.6}],[{"label":3,"value":0},{"label":4,"value":0},{"label":5,"value":0.02},{"label":6,"value":0.32},{"label":7,"value":0.97},{"label":8,"value":2.35},{"label":9,"value":4.77},{"label":10,"value":7.93},{"label":11,"value":11.15},{"label":12,"value":14.2},{"label":13,"value":15.29},{"label":14,"value":14.88},{"label":15,"value":12.04},{"label":16,"value":8.63},{"label":17,"value":4.93},{"label":18,"value":2.51}],[{"label":3,"value":0},{"label":4,"value":0},{"label":5,"value":0},{"label":6,"value":0.16},{"label":7,"value":0.63},{"label":8,"value":1.77},{"label":9,"value":4},{"label":10,"value":7.24},{"label":11,"value":10.67},{"label":12,"value":14.07},{"label":13,"value":15.71},{"label":14,"value":15.73},{"label":15,"value":12.73},{"label":16,"value":9.28},{"label":17,"value":5.31},{"label":18,"value":2.71}]],
      // https://michaelnthiessen.com/force-re-render/
      graphKey: 0,
      graphWidth: 0,

      // https://www.npmjs.com/package/vue-worker
      // yes it has to be in data and not in methods
      simulate: (diceConfigs, minRoll, maxRoll, sampleSize) => {

        let i = 0
        let j = 0
        let v = 0
        let vd = 0
        let k = 0
        let l = 0
        let maxY = Number.MIN_SAFE_INTEGER
        let points = []
        let data = {}
        let dice = []
        let roll = 0
        let roll2 = 0
        let lowest = 0
        const rolls = {}
        const graphData = []

        diceConfigs.forEach((dc) => {
          
          dice = dc.dice.filter((d) => d.active && (d.n || d.mod))
          data = { }
          for (i = minRoll; i <= maxRoll; i++)
            data[i] = 0
          
          dice.forEach((d) => {
            rolls[d.v] = new Array(d.n)
          })
          
          for (k = 0; k < sampleSize; k++) {
            
            v = 0
            
            dice.forEach((d) => {

              for (j = 0; j < d.n; j++) {

                // first roll considering rerolls

                if (d.rr && !d.rrO)
                  roll = Math.floor(Math.random() * (d.v - d.rr)) + d.rr + 1

                else if (d.rr && d.rrO) {
                  roll = Math.floor(Math.random() * d.v) + 1
                  if (roll <= d.rr)
                    roll = Math.floor(Math.random() * d.v) + 1

                } else
                  roll = Math.floor(Math.random() * d.v) + 1

                // second roll considering rerolls

                if (d.adv === 'adv' || d.adv === 'disadv') {

                  if (d.rr && !d.rrO)
                    roll2 = Math.floor(Math.random() * (d.v - d.rr)) + d.rr + 1

                  else if (d.rr && d.rr0) {
                    roll2 = Math.floor(Math.random() * d.v) + 1
                    if (roll2 <= d.rr)
                      roll2 = Math.floor(Math.random() * d.v) + 1

                  } else
                    roll2 = Math.floor(Math.random() * d.v) + 1

                  if (d.adv === 'adv')
                    roll = roll > roll2 ? roll : roll2
                  else
                    roll = roll < roll2 ? roll : roll2

                }

                rolls[d.v][j] = roll
              }

              // drop lowest rolls

              if (d.dl) {
                for (l = 0; l < d.dl; l++) {
                  lowest = 0
                  for (j = 1; j < d.n; j++)
                    if ((rolls[d.v][j] > 0 && rolls[d.v][j] < rolls[d.v][j - 1]) || rolls[d.v][j - 1] === 0)
                      lowest = j
                  rolls[d.v][lowest] = 0
                }
              }

              // apply factor and modifier

              vd = 0

              for (j = 0; j < d.n; j++)
                vd += rolls[d.v][j]
              vd += d.mod
              if (d.add)
                v += vd
              else
                v -= vd

            })

            // register data point

            data[v]++

          }

          // convert data to graph points

          points = []
          for (i = minRoll; i <= maxRoll; i++) {
            v = Math.round(data[i] / sampleSize * 10000) / 100
            points.push({ label: i, value: v })  
            if (v > maxY)
              maxY = v          
          }
          graphData.push(points)
        })

        maxY = Math.ceil(maxY)
        return { graphData, maxY }
      },
    }
  },
  computed: {
    minRoll() {
      if (this.diceConfigs.length === 0)
        return 0
      let min = Number.MAX_SAFE_INTEGER
      this.diceConfigs.forEach(dc => {
        min = min < dc.minR ? min : dc.minR
      })
      return min
    },
    maxRoll() {
      if (this.diceConfigs.length === 0)
        return 0
      let max = Number.MIN_SAFE_INTEGER
      this.diceConfigs.forEach(dc => {
        max = max > dc.maxR ? max : dc.maxR
      })
      return max
    },
  },
  mounted() {
    // https://stackoverflow.com/questions/46345947/vuejs-get-width-of-div
    this.graphWidth = this.$refs.config.clientWidth - 50
  },
  methods: {

    // --- Control Bar ---

    filterSampleSize() {
      if (!this.sampleSize.toString().match(/\d+/g))
        this.sampleSize = 100000
    },

    addDC() {
      this.diceConfigs.push(JSON.parse(JSON.stringify(this.baseDiceConfig)))
    },

    async calculate() {
      let i = 0
      while (i < this.diceConfigs.length) {
        if (!this.diceConfigs[i].minR && !this.diceConfigs[i].maxR)
          this.diceConfigs.splice(i, 1)
        else
          i++
      }
      if (this.diceConfigs.length === 0) {
        this.diceConfigs.push(JSON.parse(JSON.stringify(this.baseDiceConfig)))
        return
      }

      this.shrink = true
      await this.sleep(250)
      this.calculating = true
      this.grow = true
      this.graphData = []
      
      let worker = this.$worker.create([{ message: 'simulate', func: this.simulate }])
      worker.postMessage('simulate', [this.diceConfigs, this.minRoll, this.maxRoll, this.sampleSize])
        .then(({graphData, maxY}) => {
          this.calculating = false
          this.shrink = false
          this.grow = false
          this.maxY = maxY
          this.graphData = graphData
          this.graphKey++
          worker = null
        })
        .catch(() => { 
          this.calculating = false
          this.shrink = false
          this.grow = false
        })
    },


    // --- Dice Config ---

    deleteDC(i) {
      if (this.diceConfigs.length > 1) {
        this.diceConfigs.splice(i, 1)
        this.graphData.splice(i, 1)
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

    toggleDiceLabel(d, i) {
      d.active = !d.active
      this.updateDC(i)
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

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },


  },
}
</script>

<style scoped lang="sass">

$light-black: rgb(50, 50, 50)
$light-color: rgb(180, 120, 240)
$dark-color: rgb(100, 50, 150)

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

@mixin unselectable
  -webkit-user-select: none 
  -moz-user-select: none
  -ms-user-select: none
  user-select: none

*
  font-family: Helvetica, Arial, sans-serif
  box-sizing: border-box
  @include unselectable

input
  outline: none

main
  width: 90%
  @include flex-col-layout
  padding-bottom: 25px
  overflow-x: hidden
  position: relative

.flex-break
  page-break-after: always
  break-after: always


.rolling-message
  opacity: 0
  transition: opacity 2s ease

  p
    letter-spacing: 2px
    word-spacing: 2px

.rolling-message.calculating
  opacity: 1
  position: absolute
  top: 20px

  
.config
  @include flex-col-layout
  width: 100%

  overflow: hidden
  height: auto
  
  transform: translateX(0)
  transition: all 0.25s


.config.shrink
  transform: translateX(-100vw)
  transition: all 0.25s


.config.grow
  transform: translateX(100vw)
  transition: none

.top-box
  @include flex-row-layout($justify: space-evenly)
  flex-wrap: wrap
  align-items: center
  width: 100%
  padding: 5px
  font-size: large

  .sample-size input
    text-align: center
    padding: 8px
    border-radius: 20px
    border: 2px solid $dark-color
    max-width: 150px
    outline: none
    font-size: large

  button
    min-width: 200px
    padding: 8px
    border: 2px solid $dark-color
    border-radius: 25px
    font-size: large

    background-color: $dark-color
    color: white
    transition: background-color 0.25s ease, color 0.25s ease

    &:active
      box-shadow: 0 0 3px $light-color

    &:hover
      cursor: pointer
      background-color: white
      color: black

.dice-config
  width: 100%
  position: relative
  @include flex-row-layout($justify: center)
  flex-wrap: wrap
  padding: 10px
  border: 2px solid $dark-color
  border-radius: 15px

  .selected
    background-color: $light-color

  .x
    position: absolute
    top: 10px
    right: 10px
    width: 20px
    height: 20px
    border: none
    background-color: $dark-color
    color: white
    border-radius: 50%
    text-align: center
    font-family: monospace

    &:hover
      cursor: pointer
      box-shadow: 0 0 3px $light-color

  .polyhedrons
    @include flex-row-layout
    width: 100%
    
    .polyhedron
      min-width: 32px
      min-height: 32px
      max-width: 32px
      max-height: 32px
  
      &:hover
        cursor: pointer

  .dice-box
    @include flex-row-layout($justify: center)
    flex-wrap: wrap
    padding: 10px
    border: 1px solid $dark-color
    border-radius: 20px
    box-shadow: 0 0 2px $light-color
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
      @include flex-row-layout($gap-size: 2px, $justify: center)
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
        border: 1px solid $dark-color
        background-color: white

        transition: background-color 0.15s ease, color 0.15s ease

        &:hover
          cursor: pointer
          background-color: $dark-color
          color: white

        &:active
          background-color: $light-color

      .minus
        border-radius: 0 0 50% 50%
        border-top: none

      .plus
        border-radius: 50% 50% 0 0
        border-bottom: none

      input.short-number
        width: 40px
        height: 40px
        text-align: center
        border-radius: 50%
        border: 1px solid $dark-color

      .ftb-left, .ftb-right
        width: 35px
        font-size: small

    .reroll
      min-width: 85px
      max-width: 85px

      .ftb-left, .ftb-right
        width: 42px

      input.short-number
        border: none
        border-bottom: 1px solid $dark-color
        border-radius: 0
        height: 20px
        width: 30px

    .footer-toggle-box
      display: flex
      justify-content: center
      gap: 0

      .ftb-left, .ftb-right
        border: 1px solid $dark-color
        padding: 1px
        text-align: center
        font-family: monospace
        transition: background-color 0.15s ease, color 0.15s ease

        &:hover
          cursor: pointer
          background-color: $dark-color
          color: white
      
      .ftb-right
        border-radius: 0 7px 7px 0
        border-left: none

      .ftb-left
        border-radius: 7px 0 0 7px
        border-right: none
    
    .advantage
      
      .ftb-left, .ftb-right
        width: 95px

      .ftb-right
        border-left: 1px solid $light-black

.graph
  width: 100%
  flex-basis: 100%
  padding: 15px
  @include flex-row-layout

</style>
