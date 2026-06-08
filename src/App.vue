<template>
  <v-app>
    <v-main>
      <v-btn
        color="primary"
        style="position: fixed; top: 16px; right: 16px; z-index: 100;"
        @click="$refs.addDialog.open()"
      >
        + เพิ่มข้อมูล
      </v-btn>

      <AddDialog ref="addDialog" @saved="$refs.incomponents.fetchData()" />
      <Incomponents ref="incomponents" />
    </v-main>
  </v-app>
</template>

<script>
import Incomponents from './components/Incomponents.vue'
import AddDialog from './components/Add.vue'

export default {
  name: 'App',
  components: {
    Incomponents,
    AddDialog,
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
