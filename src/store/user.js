import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminLogin, adminLogout, getUserInfo } from '@/api/sso'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(null)

  /**
   * 管理员登录
   */
  const login = async (username, password) => {
    try {
      const res = await adminLogin(username, password)
      
      // 保存 Token（管理员只存tokenValue，不需要Bearer前缀）
      token.value = res.data.tokenValue
      localStorage.setItem('admin_token', res.data.tokenValue)
      
      // 获取用户信息
      await fetchUserInfo()
      
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      return res.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await adminLogout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地数据
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('admin_token')
      
      ElMessage.success('已退出登录')
      router.push('/admin/login')
    }
  }

  /**
   * 检查是否已登录
   */
  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchUserInfo,
    isAuthenticated
  }
})
