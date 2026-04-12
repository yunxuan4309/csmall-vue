<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>用户登录</h2>
        <p>欢迎回来</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
        <span class="divider">|</span>
        <router-link to="/login" class="back-link">返回选择</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useFrontUserStore } from '@/store/frontUser'
import { REGEX_USERNAME, REGEX_PASSWORD } from '@/utils/constants'

const router = useRouter()
const userStore = useFrontUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: REGEX_USERNAME, message: '用户名格式不正确（4~16位字母数字，首字符为字母）', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: REGEX_PASSWORD, message: '密码格式不正确（4~16位可打印ASCII字符）', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        await userStore.login(loginForm.username, loginForm.password)
        
        ElMessage.success('登录成功')
        
        // 跳转到首页
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } catch (error) {
        console.error('登录失败:', error)
        // 错误消息已在拦截器中显示
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 30px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 26px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.footer-text {
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #fa2c19;
  margin-left: 5px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}

.back-link {
  color: #409eff;
  margin-left: 5px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
