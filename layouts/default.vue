<template>
  <div id="app">
    <header>
      <div id="h-title">D&amp;D Dice Distributions</div>
      <div id="h-links">
        <nuxt-link to="/help">Help</nuxt-link>
        <nuxt-link to="/config/abilityscore">Ability Scores</nuxt-link>
        <nuxt-link to="/config/advantage">Advantage</nuxt-link>
        <nuxt-link to="/config/attackcombos">Attack Combos</nuxt-link>
        <nuxt-link to="/config/banebless">Bane &amp; Bless</nuxt-link>
        <nuxt-link to="/config/lucky">Lucky</nuxt-link>
      </div>
    </header>
    <Nuxt />
    <footer>
      <nuxt-link to="/help">Help</nuxt-link>
      <div>v0.0.1</div>
      <div>by <a href="https://www.github.com/tobi208">Tobi208</a></div>
      <div>give <nuxt-link to="/feedback" target="_blank">Feedback</nuxt-link></div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>

<style lang="sass">

$light-black: rgb(50, 50, 50)
$light-color: rgb(180, 120, 240)
$dark-color: rgb(100, 50, 150)
$super-dark-color: rgb(75, 25, 125)

@mixin unselectable
  -webkit-user-select: none 
  -moz-user-select: none
  -ms-user-select: none
  user-select: none

*
  box-sizing: border-box

html, body, #__nuxt, #__layout
  width: 100vw
  margin: 0

html, body, #__nuxt, #__layout, #app
  min-height: 100vh

#__layout
  display: flex
  justify-content: center

#app
  display: flex
  flex-direction: column
  gap: 15px
  align-items: center
  max-width: 1200px
  width: 100%

  header
    @include unselectable
    width: 100%
    display: flex
    flex-direction: column
    align-items: center
    gap: 10px
    padding-bottom: 20px
    margin-bottom: 20px

    border-bottom: 1px solid $light-black

    #h-title
      font-family: Verdana, Geneva, Tahoma, sans-serif
      width: 100%
      text-align: center
      padding: 20px 0 20px 0
      color: $super-dark-color
      letter-spacing: 2px
      word-spacing: 7px
      font-weight: 900
      font-size: 44px
      background-image: linear-gradient(to bottom, $super-dark-color, $light-color)
      color: transparent
      background-clip: text
      -webkit-background-clip: text

    #h-links
      width: 100%
      display: flex
      justify-content: space-evenly
      gap: 10px

      a
        color: black
        font-family: monospace

        &:hover
          color: $dark-color

  footer
    @include unselectable
    margin-top: auto
    border-top: 1px solid $light-black
    padding: 20px 0
    width: 100%
    display: flex
    justify-content: space-evenly
    gap: 10px
    
    div, a, div a
      font-family: monospace
      color: black

</style>