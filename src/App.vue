<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <RouterView v-if="route.name === 'login'" />
  <div v-else class="flex h-screen flex-col overflow-hidden bg-[#080a08]">
    <AppHeader />
    <div class="min-h-0 flex-1">
      <RouterView />
    </div>
  </div>
</template>
