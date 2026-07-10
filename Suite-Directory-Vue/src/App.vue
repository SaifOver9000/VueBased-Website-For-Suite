<script setup>
import SuiteCard from './components/SuiteCard.vue';
const testSuite = {
  name: 'Test Suite',
  location: 'Toronto',
  image: 'https://picsum.photos/400',
  keyfeatures: '2 Bathroom, 3 bed'
}
</script>

<template>
<SuiteCard :suite="testSuite"/>
</template>

<style scoped></style>
