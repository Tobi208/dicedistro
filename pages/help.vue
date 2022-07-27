<template>
  <main>

    <p class="bold xx-large letter-spacing word-spacing georgia">About</p>

    <p>D&amp;D Dice Distributions is a small web application to simulate dice rolls. It is specifically designed to suit Table Top Role Playing Games like <a href="https://dnd.wizards.com/" target="_blank">Dungeons and Dragons</a> that employ a 7-dice-set.</p>

    <p>The random number generation is done with Javascript's <span style="font-family: monospace; font-weight: bold; font-size: large">Math.random()</span>.</p>

    <p>This project is being developed and maintained by one person as a hobby. If you find any mistakes or have any suggestions or just want to say <i>Hi</i>, send me <nuxt-link to="/feedback">feedback</nuxt-link>!</p>


    <p class="bold xx-large letter-spacing word-spacing padding-top georgia">Examples</p>

    <p>Have you ever wondered how different forms of rolling for stats compare? Should you roll 4 d6 and drop the lowest and reroll 1s or is that too powerful? You can find out now by viewing the <nuxt-link to="/config/abilityscore">Ability Scores</nuxt-link> configuration.</p>

    <p>How hard is your DM screwing you over by giving you disadvantage on ability checks for no apparent reason? How worth could it be to put yourself in a tough spot for that advantage on the attack role? Say no more, here are the <nuxt-link to="/config/advantage">Advantage &amp; Disadvantage</nuxt-link> comparisons.</p>

    <p>Does it feel like your Rogue is doing a <i>little</i> too much damage compared to the Barbarian or Fighter whenever they get their Sneak Attack? How lucky did your Paladin roll when they destroyed that poor zombie with a 60 damage Divine Smite at level 5? You will find the answers in the <nuxt-link to="/config/attackcombos">Attack Combos</nuxt-link> configuration.</p>

    <p>Your Cleric and Warlock are constantly fighting about who is more useful to the party with their respective Bless and the Bard can not shut up about their Inspiration? Show them the <nuxt-link to="/config/baneblessinspiration">Bane &amp; Bless &amp; Inspiration</nuxt-link> configuration.</p>

    <p>Your friend is playing a Halfling purely for that sweet, sweet Luck. Should they have played a Gnome instead or is it worth to be able to reroll 1s? The results on <nuxt-link to="/config/lucky">Lucky</nuxt-link> may shock you.</p>


    <p class="bold xx-large letter-spacing word-spacing padding-top georgia">How To Use</p>


    <p class="x-large letter-spacing georgia">Button Bar</p>

    <p>Press <b>Add Dice Config</b> to add a new configuration of a set of dice. Each configuration will be simulated individually. The minium and maximum x-axis values are equal across the configurations to make it easier to compare the results.</p>

    <p>Adjust the <b>Sample Size</b> as needed. A higher number means a more accurate simulation, but also requires more computing power. Keep in mind that this application is entirely <b>client-side</b>. Specifically, the rolls are simulated in a separate web-worker.</p>

    <p>Press <b>Simulate Distribution</b> to start a web-worker that randomly throws each <b>Dice Config</b> <b>Sample Size</b>-amount of times. The total value of each roll increments the number of rolls with that value. The total number is then divided by <b>Sample Size</b> to calculate its percentage share.</p>


    <p class="x-large letter-spacing small-padding-top georgia">Dice Config</p>

    <p>Press on any of the fancy <b>Dice Symbols</b> to activate the corresponding dice and press it again to deactivate it. Only visible dice are considered in the simulation</p>


    <p class="x-large letter-spacing small-padding-top georgia">Dice Box</p>

    <p>Enter the number of times you want to roll that type of dice in <b>Roll</b>. The value must be a positive integer less than 100. <b>Sub Add</b> determines whether the total roll value is <i>added</i> to the total <b>Dice Config</b> roll or <i>subtracted</i> from it.</p>

    <p>Enter the value of rolls you wish to reroll in <b>Reroll</b>. A dice roll result of equal or lesser value is rerolled. You can choose to reroll that result <b>Once</b> or <b>Always</b>. The value must be a positive integer less than the maxium possible result.</p>

    <p>Enter the number of lowest results you wish to drop in <b>Drop</b>. The dropped results do not count towards to total roll value. The value must be a positive integer less than the number of rolls.</p>

    <p>Enter the flat number that is to be added to the total dice roll in <b>Modifier</b>. It is affected by <b>Sub Add</b>. You can have an empty dice roll with only a modifier if you wish.</p>

    <p>You can have <i>either</i> <b>Advantage</b> <i>or</i> <b>Disadvantage</b> <i>or</i> neither since having disadvantage <i>and</i> advantage cancels each other out. Rerolls are applied to <i>both</i> rolls if advantage or disadvantage is active.</p>


    <p class="x-large letter-spacing small-padding-top georgia">The Graph</p>

    <p>The summed up roll value of every <b>Dice Box</b> is recorded for each simulation iteration. The total number of times a summed up value is rolled is divided by the number of iterations. Thus, each bar shows the percentage share of numbers a value was rolled in the simulation.</p>


    <p class="bold xx-large letter-spacing word-spacing padding-top georgia">Simulation Pseudocode</p>

    <img src="@/assets/pseudocode.webp" alt="Simulation Pseudocode"/>


  </main>
</template>

<script>
export default {
  name: 'HelpPage',
}
</script>

<style scoped lang="sass">

$light-black: rgb(50, 50, 50)
$light-color: rgb(180, 120, 240)
$dark-color: rgb(100, 50, 150)
$super-dark-color: rgb(75, 25, 125)

*
  font-family: Helvetica, Arial, sans-serif
  box-sizing: border-box
  
main
  width: 90%
  max-width: 600px
  height: 100%
  display: flex
  flex-direction: column
  align-items: left

  a
    font-family: monospace
    font-size: large
    color: black

  p
    padding: 0
    margin: 10px

  .georgia
    font-family: Georgia, 'Times New Roman', Times, serif

  .bold
    font-weight: bold

  .xx-large
    font-size: xx-large

  .x-large
    font-size: x-large

  .letter-spacing
    letter-spacing: 2px

  .word-spacing
    word-spacing: 2px

  .padding-top
    padding-top: 20px

  .small-padding-top
    padding-top: 10px

</style>
