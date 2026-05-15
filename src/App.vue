<template>
  <router-view />
  <!-- AI 悬浮窗（登录后显示） -->
  <FloatingAI v-if="isLoggedIn" />
</template>

<script setup>
import { computed } from 'vue'
import { useFrontUserStore } from '@/store/frontUser'
import FloatingAI from '@/components/common/FloatingAI.vue'

const frontUserStore = useFrontUserStore()
const isLoggedIn = computed(() => !!frontUserStore.token)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
