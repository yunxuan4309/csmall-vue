<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建新账号</p>
      </div>
      
      <nut-form
        ref="registerFormRef"
        :model-value="registerForm"
        class="register-form"
      >
        <nut-form-item label="用户名" required>
          <nut-input
            v-model="registerForm.username"
            placeholder="4~16位字母数字，首字符为字母"
            clearable
            @blur="checkUsername"
          />
        </nut-form-item>
        
        <nut-form-item label="昵称" required>
          <nut-input
            v-model="registerForm.nickname"
            placeholder="2~16个字符"
            clearable
          />
        </nut-form-item>
        
        <nut-form-item label="密码" required>
          <nut-input
            v-model="registerForm.password"
            type="password"
            placeholder="4~16位可打印ASCII字符"
          />
        </nut-form-item>
        
        <nut-form-item label="确认密码" required>
          <nut-input
            v-model="registerForm.ackPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </nut-form-item>
        
        <nut-form-item label="邮箱" required>
          <nut-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            clearable
            @blur="checkEmail"
          />
        </nut-form-item>
        
        <nut-form-item label="手机号" required>
          <nut-input
            v-model="registerForm.phone"
            placeholder="请输入11位手机号"
            clearable
            @blur="checkPhone"
          />
        </nut-form-item>
        
        <div class="register-button-wrapper">
          <nut-button 
            type="primary" 
            block 
            size="large" 
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </nut-button>
        </div>
      </nut-form>
      
      <div class="register-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { checkValue, userRegister } from '@/api/user'
import { 
  REGEX_USERNAME, 
  REGEX_PASSWORD, 
  REGEX_NICKNAME, 
  REGEX_EMAIL, 
  REGEX_PHONE,
  CHECK_TYPE
} from '@/utils/constants'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  ackPassword: '',
  email: '',
  phone: ''
})

// 检查用户名是否重复
const checkUsername = async () => {
  if (!registerForm.username || !REGEX_USERNAME.test(registerForm.username)) {
    return
  }
  
  try {
    await checkValue(registerForm.username, CHECK_TYPE.USERNAME)
    showToast({ message: '用户名可用', type: 'success' })
  } catch (error) {
    showToast({ message: error.message || '该用户名已被注册', type: 'danger' })
  }
}

// 检查邮箱是否重复
const checkEmail = async () => {
  if (!registerForm.email || !REGEX_EMAIL.test(registerForm.email)) {
    return
  }
  
  try {
    await checkValue(registerForm.email, CHECK_TYPE.EMAIL)
    showToast({ message: '邮箱可用', type: 'success' })
  } catch (error) {
    showToast({ message: error.message || '该邮箱已被注册', type: 'danger' })
  }
}

// 检查手机号是否重复
const checkPhone = async () => {
  if (!registerForm.phone || !REGEX_PHONE.test(registerForm.phone)) {
    return
  }
  
  try {
    await checkValue(registerForm.phone, CHECK_TYPE.PHONE)
    showToast({ message: '手机号可用', type: 'success' })
  } catch (error) {
    showToast({ message: error.message || '该手机号已被注册', type: 'danger' })
  }
}

// 表单验证
const validateForm = () => {
  if (!registerForm.username) {
    showToast({ message: '请输入用户名', type: 'warning' })
    return false
  }
  if (!REGEX_USERNAME.test(registerForm.username)) {
    showToast({ message: '用户名格式不正确', type: 'warning' })
    return false
  }
  if (!registerForm.nickname) {
    showToast({ message: '请输入昵称', type: 'warning' })
    return false
  }
  if (!REGEX_NICKNAME.test(registerForm.nickname)) {
    showToast({ message: '昵称长度不正确', type: 'warning' })
    return false
  }
  if (!registerForm.password) {
    showToast({ message: '请输入密码', type: 'warning' })
    return false
  }
  if (!REGEX_PASSWORD.test(registerForm.password)) {
    showToast({ message: '密码格式不正确', type: 'warning' })
    return false
  }
  if (!registerForm.ackPassword) {
    showToast({ message: '请确认密码', type: 'warning' })
    return false
  }
  if (registerForm.password !== registerForm.ackPassword) {
    showToast({ message: '两次输入的密码不一致', type: 'warning' })
    return false
  }
  if (!registerForm.email) {
    showToast({ message: '请输入邮箱', type: 'warning' })
    return false
  }
  if (!REGEX_EMAIL.test(registerForm.email)) {
    showToast({ message: '邮箱格式不正确', type: 'warning' })
    return false
  }
  if (!registerForm.phone) {
    showToast({ message: '请输入手机号', type: 'warning' })
    return false
  }
  if (!REGEX_PHONE.test(registerForm.phone)) {
    showToast({ message: '手机号格式不正确', type: 'warning' })
    return false
  }
  return true
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    await userRegister({
      username: registerForm.username,
      nickname: registerForm.nickname,
      password: registerForm.password,
      ackPassword: registerForm.ackPassword,
      email: registerForm.email,
      phone: registerForm.phone
    })
    
    showToast({ message: '注册成功！请登录', type: 'success' })
    
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
    // 错误消息已在拦截器中显示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 450px;
  padding: 30px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 25px;
}

.register-header h2 {
  font-size: 26px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.register-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.register-form {
  margin-top: 20px;
}

.register-button-wrapper {
  margin-top: 25px;
  padding: 0 10px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.footer-text {
  font-size: 14px;
  color: #666;
}

.register-footer a {
  color: #fa2c19;
  margin-left: 5px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
