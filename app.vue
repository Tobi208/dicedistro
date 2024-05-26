<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import presets from '~/assets/data/presets.json'

const VueBarChart = resolveComponent('VueBarChart')

useHead({ title: 'DnD Dice Distro' })

const route = useRoute()
const baseConfig = presets.Base
let queryConfig = route.query.preset || 'Base'
let selectedConfig = presets[queryConfig] || baseConfig

const shrink = ref(false)
const grow = ref(false)
const calculating = ref(false)
const sampleSize = ref(100000)
const i2d = { 0: 4, 1: 6, 2: 8, 3: 10, 4: 12, 5: 20, 6: 100 }
const diceConfigs = ref(JSON.parse(JSON.stringify(selectedConfig.diceConfigs)))
const graphData = ref(JSON.parse(JSON.stringify(selectedConfig.graphData)))
const maxY = ref(selectedConfig.maxY)
// https://michaelnthiessen.com/force-re-render/
const graphKey = ref(0)
const graphWidth = ref(0)

const config = ref()

// load a preset when the url changes
watch(route, async () => {
  if (route.query.preset) {
    queryConfig = route.query.preset || 'Base'
    selectedConfig = presets[queryConfig] || baseConfig
    diceConfigs.value = JSON.parse(JSON.stringify(selectedConfig.diceConfigs))
    graphData.value = JSON.parse(JSON.stringify(selectedConfig.graphData))
    graphKey.value++
  }
})

const minRoll = computed(() => {
  if (diceConfigs.value.length === 0)
    return 0
  let min = Number.MAX_SAFE_INTEGER
  diceConfigs.value.forEach(dc => {
    min = min < dc.minR ? min : dc.minR
  })
  return min
})

const maxRoll = computed(() => {
  if (diceConfigs.value.length === 0)
    return 0
  let max = Number.MIN_SAFE_INTEGER
  diceConfigs.value.forEach(dc => {
    max = max > dc.maxR ? max : dc.maxR
  })
  return max
})

onMounted(() => {
  // https://stackoverflow.com/questions/46345947/vuejs-get-width-of-div
  graphWidth.value = config.value.clientWidth - 50
})

// --- Control Bar ---

const filterSampleSize = () => {
  if (!sampleSize.value.toString().match(/\d+/g))
    sampleSize.value = 100000
}

const addDC = () => {
  diceConfigs.value.push(JSON.parse(JSON.stringify(baseConfig.diceConfigs[0])))
}

const calculate = async () => {
  let i = 0
  while (i < diceConfigs.value.length) {
    if (!diceConfigs.value[i].minR && !diceConfigs.value[i].maxR)
      diceConfigs.value.splice(i, 1)
    else
      i++
  }
  if (diceConfigs.value.length === 0) {
    addDC()
    return
  }

  shrink.value = true
  await sleep(250)
  calculating.value = true
  grow.value = true
  graphData.value = []
  
  // https://github.com/mdn/dom-examples/tree/main/web-workers/simple-web-worker
  const { newGraphData, newMaxY } = await calculate_worker()
  calculating.value = false
  shrink.value = false
  grow.value = false
  maxY.value = newMaxY
  graphData.value = [...newGraphData]
  graphKey.value++
}

const calculate_worker = () => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('worker.js')
    worker.addEventListener('message', (e) => {
      if (e.data) {
          resolve(JSON.parse(e.data))
          worker.terminate()
      }
    }, false)
    worker.postMessage(JSON.stringify({
      diceConfigs: diceConfigs.value,
      minRoll: minRoll.value,
      maxRoll: maxRoll.value,
      sampleSize: sampleSize.value
    }))
  })
}


// --- Dice Config ---

const deleteDC = (i) => {
  if (diceConfigs.value.length > 1) {
    diceConfigs.value.splice(i, 1)
    graphData.value.splice(i, 1)
  }
}

const updateDC = (i) => {
  let sumMinR = 0
  let sumMaxR = 0
  let minR = 0
  let maxR = 0

  diceConfigs.value[i].dice.forEach(d => {
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

  diceConfigs.value[i].minR = sumMinR
  diceConfigs.value[i].maxR = sumMaxR
}

const toggleDiceLabel = (d, i) => {
  d.active = !d.active
  updateDC(i)
}


// enforce max Rerolls and Drops

const updateD = (i, j) => {
  const mDL = maxDL(i, j)
  if (diceConfigs.value[i].dice[j].n > mDL)
    diceConfigs.value[i].dice[j].dl = Math.min(diceConfigs.value[i].dice[j].dl, mDL)
}


// number of rolls

const incN = (i, j) => {
  if (diceConfigs.value[i].dice[j].n < 99) {
    diceConfigs.value[i].dice[j].n++
    updateDC(i)
  }
}
const decN = (i, j) => {
  if (diceConfigs.value[i].dice[j].n > 0) {
    diceConfigs.value[i].dice[j].n--
    updateDC(i)
    updateD(i, j)
  }
}
const filterN = (i, j) => {
  const n = diceConfigs.value[i].dice[j].v
  if (!n.toString().match(/^\d+$/g)) {
    diceConfigs.value[i].dice[j].n = 0
  } else {
    if (n > 99) {
      diceConfigs.value[i].dice[j].n = 99
    } else if (n < 0) {
      diceConfigs.value[i].dice[j].n = 0
    }
    updateDC(i)
    updateD(i, j)
  }
}

// reroll rolls lower than

const incRR = (i, j) => {
  const mRR = maxRR(i, j)
  if (diceConfigs.value[i].dice[j].rr < mRR) {
    diceConfigs.value[i].dice[j].rr++
    if (!diceConfigs.value[i].dice[j].rrO) {
      updateDC(i)
    }
  }
}
const decRR = (i, j) => {
  if (diceConfigs.value[i].dice[j].rr > 0) {
    diceConfigs.value[i].dice[j].rr--
    updateDC(i)
  }
}
const filterRR = (i, j) => {
  const rr = diceConfigs.value[i].dice[j].rr
  if (!rr.toString().match(/^\d+$/g)) {
    diceConfigs.value[i].dice[j].rr = 0
  } else {
    const mRR = maxRR(i, j)
    if (rr > mRR) {
      diceConfigs.value[i].dice[j].rr = mRR
    } else if (rr < 0) {
      diceConfigs.value[i].dice[j].rr = 0
    }
    updateDC(i)
  }
}
const maxRR = (i, j) => {
  return diceConfigs.value[i].dice[j].v - 1
}


// drop number of lowest rolls

const incDL = (i, j) => {
  const mDL = maxDL(i, j)
  if (diceConfigs.value[i].dice[j].dl < mDL) {
    diceConfigs.value[i].dice[j].dl++
    updateDC(i)
  }
}
const decDL = (i, j) => {
  if (diceConfigs.value[i].dice[j].dl > 0) {
    diceConfigs.value[i].dice[j].dl--
    updateDC(i)
  }
}
const filterDL = (i, j) => {
  const dl = diceConfigs.value[i].dice[j].dl
  if (!dl.toString().match(/^\d+$/g)) {
    diceConfigs.value[i].dice[j].dl = 0
  } else {
    const mDL = maxDL(i, j)
    if (diceConfigs.value[i].dice[j].n > mDL) {
      diceConfigs.value[i].dice[j].dl = mDL
    } else if (dl < 0) {
      diceConfigs.value[i].dice[j].dl = 0
    }
    updateDC(i)
  }
}
const maxDL = (i, j) => {
  return diceConfigs.value[i].dice[j].n > 0 ? diceConfigs.value[i].dice[j].n - 1 : 0
}


// modifier number

const incMod = (i, j) => {
  if (diceConfigs.value[i].dice[j].mod < 99) {
    diceConfigs.value[i].dice[j].mod++
    updateDC(i)
  }
}
const decMod = (i, j) => {
  if (diceConfigs.value[i].dice[j].mod > -99) {
    diceConfigs.value[i].dice[j].mod--
    updateDC(i)
  }
}
const filterMod = (i, j) => {
  const mod = diceConfigs.value[i].dice[j].mod
  if (!mod.toString().match(/^-?\d+$/g)) {
    diceConfigs.value[i].dice[j].mod = 0
  } else {
    if (mod > 99) {
      diceConfigs.value[i].dice[j].mod = 99
    } else if (mod < -99) {
      diceConfigs.value[i].dice[j].mod = -99
    }
    updateDC(i)
  }
}


// check uncheck advantage

const checkAdv = (i, j, v) => {
  diceConfigs.value[i].dice[j].adv = v === diceConfigs.value[i].dice[j].prevAdv ? '' : v
  diceConfigs.value[i].dice[j].prevAdv = diceConfigs.value[i].dice[j].adv
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

</script>

<template>
  <div id="app">
    <header>
      <div id="h-title">D&amp;D Dice Distributions</div>
      <div id="h-links">
        <a href="https://github.com/Tobi208/dicedistro" target="_blank">Help</a>
        <nuxt-link to="?preset=AbilityScores">Ability Scores</nuxt-link>
        <nuxt-link to="?preset=Advantage">Advantage</nuxt-link>
        <nuxt-link to="?preset=BaneBlessInspiration">Bane &amp; Bless &amp; Inspiration</nuxt-link>
        <nuxt-link to="?preset=Lucky">Lucky</nuxt-link>
      </div>
    </header>
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
            <div @click="toggleDiceLabel(dc.dice[0], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[0].active}" version="1.1" viewBox="0 0 398.12 403.28" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-1.3991)"><g transform="translate(-133.7 -52.851)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" style="paint-order:normal"><path d="m140.1 335.1 194.06-277.25v393.28z" style="paint-order:normal"/><path d="m528.22 335.1-194.06-277.25v393.28z" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[1], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[1].active}" version="1.1" viewBox="0 0 345.15 396.02" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-520.48 -136.48)"><g transform="translate(-105.44 78.793)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="10"><path transform="translate(167.03 -96.581)" d="m799.03 256.5-0.849 193.01-167.58 95.769-166.73-97.24 0.849-193.01 167.58-95.769z" style="paint-order:normal"/><path d="m631.76 158.45 166.73 97.24" style="paint-order:normal"/><path d="m966.07 159.92-167.58 95.769" style="paint-order:normal"/><path d="m797.64 448.7 0.849-193.01" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[2], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[2].active}" version="1.1" viewBox="0 0 345.15 396.02" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-1047.4 -33.974)"><g transform="translate(-46.304 -22.039)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" style="paint-order:normal"><path transform="translate(634.84 -98.251)" d="m799.03 256.5-0.849 193.01-167.58 95.769-166.73-97.24 0.849-193.01 167.58-95.769z" style="paint-order:normal"/><path d="m1098.7 349.79 168.42-288.78" style="paint-order:normal"/><path d="m1433 351.26-165.88-290.25" style="paint-order:normal"/><path d="m1098.7 349.79 334.3 1.4705" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[3], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[3].active}" version="1.1" viewBox="0 0 383.93 391.9" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-344.74 -348.78)"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".98109"><rect transform="matrix(.6997 .71443 -.6997 .71443 0 0)" x="631.17" y="-135.92" width="267.16" height="267.25" stroke-width="10.001" style="paint-order:normal"/><path d="m536.74 353.83-92.407 180.14-94.588 10.793" stroke-width="10" style="paint-order:normal"/><path d="m723.67 544.69-92.374-10.76-94.556-180.11" stroke-width="10" style="paint-order:normal"/><path d="m444.33 533.97 92.374 28.759 94.588-28.792" stroke-width="10" style="paint-order:normal"/><path d="m536.67 735.63-0.0305-172.9" stroke-width="10" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[4], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[4].active}" version="1.1" viewBox="0 0 373.22 389.4" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-1647 -400.79)"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".98109" style="paint-order:normal"><path transform="matrix(.94994 0 0 .94381 1141.9 -150.6)" d="m728.1 589.51 118.15 38.388 73.018 100.5v124.23l-73.018 100.5-118.15 38.388-118.15-38.388-73.018-100.5 1e-5 -124.23 73.018-100.5z" stroke-width="10.561" style="paint-order:normal"/><path transform="matrix(.99869 0 0 1.0588 1116.6 -319.51)" d="m717.95 750.47 108.27 78.665-41.357 127.28-133.83-1e-5 -41.357-127.28z" stroke-width="9.7247" style="paint-order:normal"/><path d="m1833.6 405.79-1e-4 69.295" stroke-width="10" style="paint-order:normal"/><path d="m1941.7 558.38 73.463-21.501" stroke-width="10" style="paint-order:normal"/><path d="m1900.4 693.14 45.403 55.831" stroke-width="10" style="paint-order:normal"/><path d="m1766.8 693.14-45.403 55.831" stroke-width="10" style="paint-order:normal"/><path d="m1725.5 558.38-73.463-21.501" stroke-width="10" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[5], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[5].active}" version="1.1" viewBox="0 0 343.2 393.23" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-1620.4 -596.21)"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".98109"><path transform="matrix(1.1463 0 0 1.1419 535.25 -197.36)" d="m1241.7 783.25v167.81l-145.32 83.903-145.32-83.903v-167.81l145.32-83.903z" stroke-width="8.7404" style="paint-order:normal"/><path transform="matrix(.90238 0 0 .91644 763.38 35.209)" d="m1139.9 668.79 124.65 215.89-249.29-1e-5z" stroke-width="10.996" style="paint-order:normal"/><path d="m1792 601.21v46.91l166.59 48.898" stroke-width="10" style="paint-order:normal"/><path d="m1792 648.12-166.59 48.898" stroke-width="10" style="paint-order:normal"/><path d="m1679.5 845.97-54.113-148.96" stroke-width="10" style="paint-order:normal"/><path d="m1625.4 888.63 54.113-42.657" stroke-width="10" style="paint-order:normal"/><path d="m1679.5 845.97 112.48 138.46 112.48-138.46" stroke-width="10" style="paint-order:normal"/><path d="m1958.6 888.63-54.113-42.657" stroke-width="10" style="paint-order:normal"/><path d="m1958.6 697.02-54.113 148.96" stroke-width="10" style="paint-order:normal"/></g></g></svg>
            </div>
            <div @click="toggleDiceLabel(dc.dice[6], index)">
              <svg :class="{polyhedron: true, glow: dc.dice[6].active}" version="1.1" viewBox="0 0 383.93 391.9" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-344.74 -348.78)"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".98109"><rect transform="matrix(.6997 .71443 -.6997 .71443 0 0)" x="631.17" y="-135.92" width="267.16" height="267.25" stroke-width="10.001" style="paint-order:normal"/><path d="m536.74 353.83-92.407 180.14-94.588 10.793" stroke-width="10" style="paint-order:normal"/><path d="m723.67 544.69-92.374-10.76-94.556-180.11" stroke-width="10" style="paint-order:normal"/><path d="m444.33 533.97 92.374 28.759 94.588-28.792" stroke-width="10" style="paint-order:normal"/><path d="m536.67 735.63-0.0305-172.9" stroke-width="10" style="paint-order:normal"/></g></g></svg>
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
            <VueBarChart
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
    <footer>
      <div>v0.0.2</div>
      <div>by <a href="https://www.github.com/tobi208" target="_blank">Tobi208</a></div>
      <div>raise <a href="https://github.com/Tobi208/dicedistro/issues" target="_blank">Issues</a></div>
      <div>seek <a href="https://github.com/Tobi208/dicedistro/blob/main/README.md" target="_blank">Help</a></div>
    </footer>
</div>
</template>

<style lang="sass">

@use "~/assets/sass/layout"
@use "~/assets/sass/dice_config"


// .flex-break
//   page-break-after: always
//   break-after: always


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

.graph
  width: 100%
  flex-basis: 100%
  padding: 15px
  @include flex-row-layout

</style>