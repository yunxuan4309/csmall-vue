<template>
  <div class="front-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <!-- 左侧：Logo -->
        <div class="left-section">
          <div class="logo" @click="$router.push('/')">
            <h2>CoolShark</h2>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="fetchSuggestions"
            :trigger-on-focus="false"
            placeholder="搜索商品，如：学生党高性价比手机"
            clearable
            popper-class="search-suggest-popper"
            @select="onSuggestSelect"
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-autocomplete>
          <el-button class="search-btn" type="primary" size="small" @click="onSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </div>

        <!-- 桌面端导航 -->
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="nav-menu hide-xs-only"
          :ellipsis="false"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/seckill">秒杀专区</el-menu-item>
          <el-menu-item index="/ai">AI 智能导购</el-menu-item>
          <el-menu-item index="/cart">购物车</el-menu-item>
          <el-menu-item index="/order/list">我的订单</el-menu-item>
        </el-menu>

        <!-- 移动端汉堡菜单 -->
        <el-button
          class="mobile-menu-btn"
          type="primary"
          link
          @click="mobileMenuVisible = !mobileMenuVisible"
        >
          <el-icon :size="24"><Menu /></el-icon>
        </el-button>

        <el-drawer
          v-model="mobileMenuVisible"
          direction="ltr"
          size="70%"
          title="导航菜单"
          :with-header="true"
        >
          <el-menu
            :default-active="activeMenu"
            mode="vertical"
            @select="(index) => { handleMenuSelect(index); mobileMenuVisible = false }"
          >
            <el-menu-item index="/products">商品列表</el-menu-item>
            <el-menu-item index="/seckill">秒杀专区</el-menu-item>
            <el-menu-item index="/ai">AI 智能导购</el-menu-item>
            <el-menu-item index="/cart">购物车</el-menu-item>
            <el-menu-item index="/order/list">我的订单</el-menu-item>
            <el-menu-item index="/user/profile" v-if="userStore.token">个人中心</el-menu-item>
          </el-menu>
        </el-drawer>

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
            <el-button @click="$router.push('/user/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
          <el-button
            type="primary"
            link
            size="small"
            class="admin-link"
            @click="goToAdminLogin"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </el-main>

    <!-- 底部 -->
    <el-footer class="footer">
      <p>&copy; 2026 CoolShark. All rights reserved.</p>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, ArrowDown, Setting, Menu, Search } from '@element-plus/icons-vue'
import { useFrontUserStore } from '@/store/frontUser'
import { getSearchSuggestions } from '@/api/search'

const route = useRoute()
const router = useRouter()
const userStore = useFrontUserStore()

const mobileMenuVisible = ref(false)
const searchKeyword = ref('')
// keep-alive 缓存列表页，离开再回来秒开
const cachedViews = ['ProductList', 'SeckillList']

const activeMenu = computed(() => route.path)

// 搜索自动补全
let suggestTimer = null
const fetchSuggestions = (queryString, callback) => {
  if (!queryString || queryString.trim().length < 1) {
    callback([])
    return
  }
  clearTimeout(suggestTimer)
  suggestTimer = setTimeout(async () => {
    try {
      const res = await getSearchSuggestions(queryString.trim())
      const list = (res.data?.suggestions || []).map(s => ({ value: s }))
      callback(list)
    } catch {
      callback([])
    }
  }, 200)
}

const onSuggestSelect = (item) => {
  searchKeyword.value = item.value
  doSearch()
}

const onSearch = () => {
  doSearch()
}

const doSearch = () => {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  router.push({ path: '/products', query: { keyword: kw } })
  searchKeyword.value = ''
}

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

const goToAdminLogin = () => {
  router.push('/admin/login')
}

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.warn('获取用户信息失败，请检查后端SSO服务是否启动:', error)
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
  border-bottom: 1px solid var(--brand-border-light, #f1f5f9);
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
  color: var(--brand-text, #1e293b);
  user-select: none;
}

.logo h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  margin-left: 40px;
  font-weight: 400;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm, 6px);
  transition: background-color var(--transition-fast, 0.2s);
  color: var(--brand-text-secondary, #64748b);
  font-size: 14px;
}

.user-info:hover {
  background-color: var(--brand-bg, #f8fafc);
}

.admin-link {
  font-size: 16px;
  color: var(--brand-text-muted, #94a3b8);
  padding: 4px;
}

.admin-link:hover {
  color: var(--brand-primary, #4a6cf7);
}

.search-box {
  flex: 1;
  max-width: 420px;
  margin: 0 24px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.search-box :deep(.el-autocomplete) {
  flex: 1;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #f5f7fa;
}

.search-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .search-box {
    max-width: 200px;
    margin: 0 8px;
  }
}

.main-content {
  flex: 1;
  background-color: var(--brand-bg, #f8fafc);
  padding: 20px;
}

@media (min-width: 768px) {
  .main-content {
    padding: 24px 40px;
  }
}

@media (min-width: 1920px) {
  .main-content {
    padding: 30px 60px;
  }
}

.mobile-menu-btn {
  display: none;
}

@media (min-width: 768px) and (max-width: 1199px) {
  .nav-menu .el-menu-item {
    font-size: 13px;
    padding: 0 12px;
  }
  .header-content {
    padding: 0 10px;
  }
  .logo h2 {
    font-size: 20px;
  }
}

@media (max-width: 767px) {
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-content {
    padding: 0 12px;
  }

  .logo h2 {
    font-size: 18px;
  }

  .main-content {
    padding: 12px;
    min-height: calc(100vh - 120px);
  }

  .footer {
    padding: 12px;
    font-size: 12px;
  }
}

.footer {
  background-color: #fff;
  text-align: center;
  padding: 20px;
  color: var(--brand-text-muted, #94a3b8);
  border-top: 1px solid var(--brand-border-light, #f1f5f9);
  font-size: 13px;
}
</style>
