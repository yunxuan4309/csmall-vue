<template>
  <div class="user-profile-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>个人中心</h2>
        </div>
      </template>

      <div v-loading="loading" class="profile-content">
        <el-descriptions title="用户信息" :column="1" border>
          <el-descriptions-item label="用户名">
            {{ userStore.userInfo?.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ userStore.userInfo?.nickname || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userStore.userInfo?.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userStore.userInfo?.email || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons">
          <el-button type="primary" @click="handleEditProfile">
            编辑资料
          </el-button>
          <el-button type="warning" @click="handleChangePassword">
            修改密码
          </el-button>
          <el-button type="danger" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFrontUserStore } from '@/store/frontUser'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useFrontUserStore()
const loading = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 编辑资料
const handleEditProfile = () => {
  ElMessage.info('功能开发中...')
}

// 修改密码
const handleChangePassword = () => {
  ElMessage.info('功能开发中...')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
}

.profile-content {
  min-height: 300px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>
