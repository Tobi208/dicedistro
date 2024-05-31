# D&D Dice Distribution

D&D Dice Distributions is a small web application to simulate dice rolls. It is specifically designed to suit Table Top Role Playing Games like [Dungeons and Dragons](https://dnd.wizards.com/) that employ a D20 system.

The random number generation is done with Javascript's `Math.random()`.

## Examples

Have you ever wondered how different forms of rolling for stats compare? Should you roll 4 d6 and drop the lowest and reroll 1s or is that too powerful? You can find out now by viewing the [Ability Scores](https://tobi208.github.io/dicedistro/?preset=AbilityScore) configuration.

How hard is your DM screwing you over by giving you disadvantage on ability checks for no apparent reason? How worth could it be to put yourself in a tough spot for that advantage on the attack role? Say no more, here are the [Disadvantage](https://tobi208.github.io/dicedistro/?preset=Disadvantage) comparisons.

Does it feel like your Rogue is doing a *little* too much damage compared to the Barbarian or Fighter whenever they get their Sneak Attack? How lucky did your Paladin roll when they destroyed that poor zombie with a 60 damage Divine Smite at level 5? You will find the answers in the [Attack Combos](https://tobi208.github.io/dicedistro/?preset=AttackCombos) (soon™) configuration.

Your Cleric and Warlock are constantly fighting about who is more useful to the party with their respective Bless and the Bard can not shut up about their Inspiration? Show them the [Bane & Bless & Inspiration](https://tobi208.github.io/dicedistro/?preset=BaneBlessInspiration) configuration.

Your friend is playing a Halfling purely for that sweet, sweet Luck. Should they have played a Gnome instead or is it worth to be able to reroll 1s? The results on [Lucky](https://tobi208.github.io/dicedistro/?preset=Lucky) may shock you.

## How To Use

### Button Bar

Press **Add Dice Config** to add a new configuration of a set of dice. Each configuration will be simulated individually. The minium and maximum x-axis values are equal across the configurations to make it easier to compare the results.

Adjust the **Sample Size** as needed. A higher number means a more accurate simulation, but also requires more computing power. Keep in mind that this application is entirely **client-side**. Specifically, the rolls are simulated in a separate web-worker.

Press **Simulate Distribution** to start a web-worker that randomly throws each **Dice Config** **Sample Size**-amount of times. The total value of each roll increments the number of rolls with that value. The total number is then divided by **Sample Size** to calculate its percentage share.

### Dice Config

Press on any of the fancy **Dice Symbols** to activate the corresponding dice and press it again to deactivate it. Only visible dice are considered in the simulation

**Dice Box**

Enter the number of times you want to roll that type of dice in **Roll**. The value must be a positive integer less than 100. **Sub Add** determines whether the total roll value is *added* to the total **Dice Config** roll or *subtracted* from it.

Enter the value of rolls you wish to reroll in **Reroll**. A dice roll result of equal or lesser value is rerolled. You can choose to reroll that result **Once** or **Always**. The value must be a positive integer less than the maxium possible result.

Enter the number of lowest results you wish to drop in **Drop**. The dropped results do not count towards to total roll value. The value must be a positive integer less than the number of rolls.

Enter the flat number that is to be added to the total dice roll in **Modifier**. It is affected by **Sub Add**. You can have an empty dice roll with only a modifier if you wish.

You can have *either* **Advantage** *or* **Disadvantage** *or* neither since having disadvantage *and* advantage cancels each other out. Rerolls are applied to *both* rolls if advantage or disadvantage is active.

### The Graph

The summed up roll value of every **Dice Box** is recorded for each simulation iteration. The total number of times a summed up value is rolled is divided by the number of iterations. Thus, each bar shows the percentage share of numbers a value was rolled in the simulation.

### Simulation Pseudocode

```python
graphData = []

for dc in diceConfigs:

  data = {}
  rolls = {}

  for _ in range(sampleSize):

    sumDiceConfigRoll = 0

    for d in dc.dice:
      
      if d.reroll > 0 and d.rerollAlways:
        minRoll = d.reroll + 1
      else:
        minRoll = 1
      maxRoll = d.value
    
      for j in range(d.numRolls):

        roll = randInt(minRoll, maxRoll)
        
        if d.rerollOnce and 0 < roll <= d.reroll:
          roll = randInt(minRoll, maxRoll)
        
        if d.advantage or d.disadvantage:
          advRoll = ... # same as roll
        if d.advantage:
          roll = max(roll, advRoll)
        if d.disadvantage:
          roll = min(roll, advRoll)
        
        rolls[d.value][j] = roll
      
      for _ in range(d.dropLowest):
        delete min(rolls[d.value])
      
      if d.add:
        sumDiceConfigRoll += sum(rolls[d.value])
      if d.sub:
        sumDiceConfigRoll -= sum(rolls[d.value])

    data[sumDiceConfigRoll]++
  
  grapData.push(data)

return graphdata
```

## Todo

* attack combos

* also provide mean, median, etc.

* custom titles

* cummulative chance

* chance to beat DC / AC with check
