<template>
  <div class="card">
    <h3>{{ suite.name }}</h3>
    <img :src="suite.image" />
    <p>{{ suite.location }}</p>
    <p>{{suite.keyfeatures}}</p>
  </div>
</template>

<script setup>
defineProps({
  suite: {
    type: Object,
    required: true
  }
})

function handleClick(event) {
  // ...
}
</script>

<style scoped>
/* ...leave this as-is for now... */
</style>