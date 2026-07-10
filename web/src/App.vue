<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-main>
      <!-- RouterView renders the matched route component without adding a dashboard or extra page shell. -->
      <RouterView />
    </v-main>
  </v-app>
</template>
