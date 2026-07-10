<script setup lang="ts">
// defineProps() declares the component input contract while keeping this Phase 0 component simple.
defineProps<{
  apiBaseUrl: string
}>()
</script>

<template>
  <v-alert type="success" variant="tonal">
    Vuetify is rendering. API base URL: {{ apiBaseUrl }}
  </v-alert>
</template>
