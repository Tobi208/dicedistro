<template>
  <main>
    <div v-show="state === 'feedback'" id="feedback-form">
      <textarea v-model.trim="message" :disabled="disabled" placeholder="Please enter your feedback here"/>
      <button :disabled="disabled" @click="submit()">Sumbit</button>
    </div>
    <div v-show="state === 'response'" id="response">
      <h2>Thank You!</h2>
    </div>
  </main>
</template>

<script>
export default {
  name: 'FeedbackPage',
  data() {
    return {
      state: 'feedback',
      message: '',
      disabled: false,
    }
  },
  head() {
    return {
      title: 'Feedback',
    }
  },
  methods: {
    async submit() {
      if(this.message) {
        this.disabled = true
        await fetch('https://api.telegram.org/bot5402297736:AAH8XhVS4d_xZJHyeGK66m0fEGPXWuO4Izg/sendMessage', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'cache-control': 'no-cache'
          },
          body: JSON.stringify({
            chat_id: '1462793878',
            text: 'DiceDistro\n\n' + this.message
          })
        })
        this.state = 'response'
      }
    },
  },
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
  width: 100%
  height: 100%
  display: flex
  justify-content: center

#feedback-form
  width: 50%
  height: 100%
  max-width: 500px
  display: flex
  flex-direction: column
  align-items: center
  gap: 15px

  textarea
    width: 100%
    padding: 15px
    border: 2px solid $dark-color
    border-radius: 15px
    resize: none
    flex: 1
    outline: none
    font-size: large
    font-family: monospace

    &:focus
      box-shadow: 0 0 3px $light-color

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

#response
  h2
    color: $dark-color
    letter-spacing: 1px
    word-spacing: 5px

</style>
