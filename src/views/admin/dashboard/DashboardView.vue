<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>
    <p class="page-subtitle">欢迎回来{{ userStore.userInfo?.nickname ? '，' + userStore.userInfo.nickname : '' }}</p>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--brand-primary)"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-success)"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.todayNewUsers }}</div>
              <div class="stat-label">今日新增用户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-warning)"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.pendingOrders }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-danger)"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ dashboard.todayRevenue || '0.00' }}</div>
              <div class="stat-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="card-clean">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/product/spu')">
              添加商品
            </el-button>
            <el-button type="success" @click="$router.push('/admin/order')">
              查看订单
            </el-button>
            <el-button type="warning" @click="$router.push('/admin/admin-user')">
              管理用户
            </el-button>
            <el-button type="info" @click="$router.push('/admin/role')">
              角色设置
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="card-clean">
          <template #header>
            <span>系统信息</span>
          </template>
          <div class="system-info">
            <p><strong>当前用户：</strong>{{ userStore.userInfo?.nickname || '管理员' }}</p>
            <p><strong>登录时间：</strong>{{ currentTime }}</p>
            <p><strong>系统版本：</strong>v1.0.0</p>
            <p><strong>技术栈：</strong>Vue 3 + Element Plus + Vite</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { User, Goods, List, Money } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { getDashboard } from '@/api/sso'

const userStore = useUserStore()
const currentTime = ref(formatDate(new Date()))

const dashboard = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  weeklyTrend: []
})

const loading = ref(true)

const fetchDashboard = async () => {
  try {
    const res = await getDashboard()
    if (res.data) {
      dashboard.value = res.data
    }
  } catch (e) {
    console.error('获取仪表盘数据失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.fetchUserInfo()
  }
  fetchDashboard()
})
</script>

<style scoped>
.dashboard h2 {
  margin: 0;
}

.stat-card {
  cursor: default;
  transition: all var(--transition-fast, 0.2s);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--brand-text, #333);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--brand-text-secondary, #999);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.system-info p {
  margin: 10px 0;
  color: var(--brand-text-secondary, #606266);
  line-height: 1.6;
}

@media (max-width: 767px) {
  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .el-row .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 10px;
  }
  .el-row .el-col:last-child:nth-child(odd) {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .stat-icon {
    font-size: 32px;
  }
  .stat-value {
    font-size: 18px;
  }
  .quick-actions {
    flex-direction: column;
  }
  .quick-actions .el-button {
    width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .el-row .el-col {
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 16px;
  }
}
</style>
