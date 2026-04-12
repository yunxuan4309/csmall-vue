<template>
  <div class="front-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <!-- 左侧：Logo 和管理员入口 -->
        <div class="left-section">
          <div class="logo" @click="$router.push('/')">
            <h2>商城首页</h2>
          </div>
          <el-button 
            type="primary" 
            link 
            size="small"
            class="admin-link"
            @click="goToAdminLogin"
          >
            <el-icon><Setting /></el-icon>
            管理员登录
          </el-button>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="nav-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/seckill">秒杀专区</el-menu-item>
          <el-menu-item index="/cart">购物车</el-menu-item>
          <el-menu-item index="/order/list">我的订单</el-menu-item>
        </el-menu>

        <div class="user-actions">
          <template v-if="userStore.token">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ userStore.userInfo?.nickname || '用户' }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/user/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- 底部 -->
    <el-footer class="footer">
      <p>© 2026 商城系统. All rights reserved.</p>
    </el-footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, ArrowDown, Setting } from '@element-plus/icons-vue'
import { useFrontUserStore } from '@/store/frontUser'

const route = useRoute()
const router = useRouter()
const userStore = useFrontUserStore()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  if (index !== route.path) {
    router.push(index)
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
  } else if (command === 'profile') {
    router.push('/user/profile')
  }
}

// 跳转到管理员登录
const goToAdminLogin = () => {
  router.push('/admin/login')
}

// 组件挂载时，如果有 token 则获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.warn('获取用户信息失败，请检查后端SSO服务是否启动:', error)
      // 不阻断页面渲染，用户可以继续使用
    }
  }
})
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  cursor: pointer;
  color: #409eff;
}

.logo h2 {
  margin: 0;
  font-size: 24px;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 4px 8px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  margin-left: 40px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
}

.footer {
  background-color: #fff;
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>
