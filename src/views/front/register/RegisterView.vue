<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建新账号</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        size="large"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="4~16位字母数字，首字符为字母"
            clearable
            @blur="checkUsername"
          />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="2~16个字符"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="4~16位可打印ASCII字符"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="ackPassword">
          <el-input
            v-model="registerForm.ackPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            clearable
            @blur="checkEmail"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入11位手机号"
            clearable
            @blur="checkPhone"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/user/login">立即登录</router-link>
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

// 表单验证规则
const validateAckPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: REGEX_USERNAME, message: '用户名格式不正确（4~16位字母数字，首字符为字母）', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { pattern: REGEX_NICKNAME, message: '昵称长度不正确（2~16个字符）', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: REGEX_PASSWORD, message: '密码格式不正确（4~16位可打印ASCII字符）', trigger: 'blur' }
  ],
  ackPassword: [
    { required: true, validator: validateAckPassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: REGEX_EMAIL, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: REGEX_PHONE, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 检查用户名是否重复
const checkUsername = async () => {
  if (!registerForm.username || !REGEX_USERNAME.test(registerForm.username)) {
    return
  }
  
  try {
    await checkValue(registerForm.username, CHECK_TYPE.USERNAME)
    ElMessage.success('用户名可用')
  } catch (error) {
    ElMessage.error(error.message || '该用户名已被注册')
  }
}

// 检查邮箱是否重复
const checkEmail = async () => {
  if (!registerForm.email || !REGEX_EMAIL.test(registerForm.email)) {
    return
  }
  
  try {
    await checkValue(registerForm.email, CHECK_TYPE.EMAIL)
    ElMessage.success('邮箱可用')
  } catch (error) {
    ElMessage.error(error.message || '该邮箱已被注册')
  }
}

// 检查手机号是否重复
const checkPhone = async () => {
  if (!registerForm.phone || !REGEX_PHONE.test(registerForm.phone)) {
    return
  }
  
  try {
    await checkValue(registerForm.phone, CHECK_TYPE.PHONE)
    ElMessage.success('手机号可用')
  } catch (error) {
    ElMessage.error(error.message || '该手机号已被注册')
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
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
        
        ElMessage.success('注册成功！请登录')
        
        // 跳转到登录页
        setTimeout(() => {
          router.push('/user/login')
        }, 1500)
      } catch (error) {
        console.error('注册失败:', error)
        // 错误消息已在拦截器中显示
      } finally {
        loading.value = false
      }
    }
  })
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
  margin-top: 30px;
}

.register-button {
  width: 100%;
  font-size: 16px;
  font-weight: 500;
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
