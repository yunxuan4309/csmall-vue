<template>
  <div class="login-portal-container">
    <div class="login-portal-box">
      <div class="portal-header">
        <h1>商城系统</h1>
        <p>请选择登录方式</p>
      </div>
      
      <div class="portal-options">
        <!-- 普通用户登录 -->
        <el-card class="option-card user-card" shadow="hover" @click="goToUserLogin">
          <div class="option-content">
            <div class="option-icon">
              <el-icon :size="60" color="#409eff"><User /></el-icon>
            </div>
            <div class="option-info">
              <h3>普通用户登录</h3>
              <p>购物客户专属通道</p>
              <ul class="feature-list">
                <li>浏览商品</li>
                <li>加入购物车</li>
                <li>下单购买</li>
                <li>查看订单</li>
              </ul>
            </div>
            <el-button type="primary" size="large" class="enter-btn">
              进入登录
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>

        <!-- 管理员登录 -->
        <el-card class="option-card admin-card" shadow="hover" @click="goToAdminLogin">
          <div class="option-content">
            <div class="option-icon">
              <el-icon :size="60" color="#67c23a"><Setting /></el-icon>
            </div>
            <div class="option-info">
              <h3>管理员登录</h3>
              <p>后台管理系统入口</p>
              <ul class="feature-list">
                <li>商品管理</li>
                <li>订单管理</li>
                <li>用户管理</li>
                <li>数据统计</li>
              </ul>
            </div>
            <el-button type="success" size="large" class="enter-btn">
              进入登录
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>

      <div class="portal-footer">
        <p>还没有账号？</p>
        <el-button type="primary" link @click="goToRegister">
          立即注册普通用户账号
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { User, Setting, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

// 跳转到普通用户登录
const goToUserLogin = () => {
  router.push('/user/login')
}

// 跳转到管理员登录
const goToAdminLogin = () => {
  router.push('/admin/login')
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-portal-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-portal-box {
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.portal-header {
  text-align: center;
  margin-bottom: 40px;
}

.portal-header h1 {
  font-size: 36px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.portal-header p {
  font-size: 16px;
  color: #999;
  margin: 0;
}

.portal-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.option-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.user-card:hover {
  border-color: #409eff;
}

.admin-card:hover {
  border-color: #67c23a;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.option-icon {
  margin-bottom: 20px;
}

.option-info {
  text-align: center;
  margin-bottom: 20px;
  flex: 1;
}

.option-info h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.option-info p {
  font-size: 14px;
  color: #999;
  margin: 0 0 20px 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-list li {
  padding: 8px 0;
  color: #606266;
  font-size: 14px;
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}

.enter-btn {
  width: 100%;
  margin-top: auto;
}

.portal-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.portal-footer p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portal-options {
    grid-template-columns: 1fr;
  }
  
  .login-portal-box {
    padding: 20px;
  }
  
  .portal-header h1 {
    font-size: 28px;
  }
}
</style>
