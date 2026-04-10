import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLogin, userLogout, getUserInfo } from '@/api/sso'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useFrontUserStore = defineStore('frontUser', () => {
  const token = ref(localStorage.getItem('mall_token') || '')
  const userInfo = ref(null)

  /**
   * 前台用户登录
   */
  const login = async (username, password) => {
    try {
      const res = await userLogin(username, password)
      
      // 保存 Token（格式：Bearer tokenValue）
      const fullToken = `${res.data.tokenHeader} ${res.data.tokenValue}`
      token.value = fullToken
      localStorage.setItem('mall_token', fullToken)
      
      // 获取用户信息
      await fetchUserInfo()
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      throw error
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
      await userLogout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地数据
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('mall_token')
      
      ElMessage.success('已退出登录')
      router.push('/login')
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
