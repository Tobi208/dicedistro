<template>
  <root>
    <header>
      <h1>D&amp;D Dice Distributions</h1>
    </header>
    <Nuxt />
  </root>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>

<style lang="sass">
*
  box-sizing: border-box

html, body, #__nuxt, #__layout
  width: 100vw
  margin: 0

#__layout
  display: flex
  justify-content: center

root
  display: flex
  flex-direction: column
  gap: 15px
  align-items: center
  max-width: 800px
  width: 100%
</style>