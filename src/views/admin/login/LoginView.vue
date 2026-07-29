<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>后台管理</h2>
        <p>管理员登录</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
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
        <div style="margin-top: 10px">
          <router-link to="/login" class="back-link">返回登录选择</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { REGEX_USERNAME, REGEX_PASSWORD } from '@/utils/constants'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

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
        const success = await userStore.login(loginForm.username, loginForm.password)
        if (!success) {
          loading.value = false
        }
      } catch (error) {
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
  background-color: var(--brand-bg, #f8fafc);
  padding: 20px;
}

.login-box {
  width: 380px;
  padding: 40px;
  background: #fff;
  border-radius: var(--radius-md, 10px);
  border: 1px solid var(--brand-border, #e2e8f0);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.06));
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  color: var(--brand-text, #1e293b);
  margin: 0 0 6px 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.login-header p {
  font-size: 14px;
  color: var(--brand-text-secondary, #64748b);
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.login-button {
  width: 100%;
  font-size: 15px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--brand-border, #e2e8f0);
}

.back-link {
  color: var(--brand-primary, #4a6cf7);
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 767px) {
  .login-container {
    padding: 12px;
    align-items: flex-start;
    padding-top: 60px;
  }
  .login-box {
    width: 100%;
    padding: 24px 16px;
  }
  .login-header h2 {
    font-size: 22px;
  }
}
</style>
