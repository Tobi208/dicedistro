onmessage = (e) => {
  const { diceConfigs, minRoll, maxRoll, sampleSize } = JSON.parse(e.data)

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

  postMessage(JSON.stringify({ newGraphData: graphData, newMaxY: maxY }))
}
