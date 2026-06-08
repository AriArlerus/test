<template>
  <v-app>
    <v-main>
      <Search />
    </v-main>
  </v-app>
</template>

<script>
import Search from './components/Search.vue'

export default {
  name: 'App',
  components: { Search },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
