<template>
  <div class="dashboard">
    <h2>欢迎使用后台管理系统</h2>
    
    <el-row :gutter="20" style="margin-top: 30px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">1,234</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">567</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">890</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥12,345</div>
              <div class="stat-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
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
      
      <el-col :span="12">
        <el-card>
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

const userStore = useUserStore()
const currentTime = ref(formatDate(new Date()))

onMounted(() => {
  // 如果没有用户信息，获取一下
  if (!userStore.userInfo) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.dashboard h2 {
  margin: 0;
  color: #333;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.system-info p {
  margin: 10px 0;
  color: #606266;
  line-height: 1.6;
}
</style>
