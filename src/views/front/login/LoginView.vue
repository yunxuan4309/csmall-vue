<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>用户登录</h2>
        <p>欢迎回来</p>
      </div>
      
      <nut-form
        ref="loginFormRef"
        :model-value="loginForm"
        class="login-form"
      >
        <nut-form-item label="用户名" required>
          <nut-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </nut-form-item>
        
        <nut-form-item label="密码" required>
          <nut-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </nut-form-item>
        
        <div class="login-button-wrapper">
          <nut-button type="primary" block size="large" @click="handleLogin">
            登 录
          </nut-button>
        </div>
      </nut-form>
      
      <div class="login-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'

const router = useRouter()
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  // 简单验证
  if (!loginForm.username) {
    showToast({ message: '请输入用户名', type: 'warning' })
    return
  }
  if (!loginForm.password) {
    showToast({ message: '请输入密码', type: 'warning' })
    return
  }
  
  // TODO: 调用登录 API
  showToast({ message: '登录功能开发中...', type: 'success' })
  
  // 示例：登录成功后跳转
  // setTimeout(() => {
  //   router.push('/home')
  // }, 1500)
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
  margin-top: 20px;
}

.login-button-wrapper {
  margin-top: 30px;
  padding: 0 10px;
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
</style>
