import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// ============ 创建实例工厂 ============

/**
 * 创建 Axios 实例
 * @param {string} baseURL - 服务基础地址
 */
function createInstance(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
  })

  // ---- 请求拦截 ----
  instance.interceptors.request.use(
    config => {
      // 尝试获取 token（优先 mall_token，其次 admin_token）
      let token = localStorage.getItem('mall_token')
      if (!token) {
        token = localStorage.getItem('admin_token')
      }
      
      if (token) {
        // 如果 token 已经包含 Bearer 前缀，直接使用；否则添加前缀
        if (token.startsWith('Bearer ')) {
          config.headers.Authorization = token
        } else {
          config.headers.Authorization = `${import.meta.env.VITE_TOKEN_PREFIX} ${token}`
        }
      }
      return config
    },
    error => Promise.reject(error)
  )

  // ---- 响应拦截 ----
  instance.interceptors.response.use(
    response => {
      const res = response.data

      // 判断后端 JsonResult.state
      if (res.state === 200) {
        // 成功：返回完整响应，页面可以取 res.data
        return res
      }

      // Token 过期或未认证
      if (res.state === 401) {
        localStorage.removeItem('mall_token')
        localStorage.removeItem('admin_token')
        // 避免登录页死循环
        const currentPath = window.location.pathname
        if (!currentPath.includes('/admin/login') && !currentPath.includes('/login') && !currentPath.includes('/user/login')) {
          ElMessage.error('登录已过期，请重新登录')
          // 根据当前路径判断跳转到哪个登录页
          if (currentPath.startsWith('/admin')) {
            router.push('/admin/login')
          } else {
            router.push('/login')
          }
        }
        return Promise.reject(new Error(res.message || '未登录'))
      }

      // 其他业务错误（400/403/404/409/500）
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    },
    error => {
      // HTTP 层面错误（网络断开、超时、跨域等）
      const msg = error.response
        ? `服务器错误 ${error.response.status}`
        : error.message || '网络异常'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
  )

  return instance
}

// ============ 导出各服务实例 ============

// SSO 服务（登录相关，端口 10002）
export const ssoHttp = createInstance(import.meta.env.VITE_API_SSO)

// 网关（其他业务请求统一走网关）
export const gatewayHttp = createInstance(import.meta.env.VITE_API_GATEWAY)

// UMS 服务（用户管理服务，端口 10006）
export const umsHttp = createInstance(import.meta.env.VITE_API_UMS)

// Front 服务（前台商品展示，端口 10004）
export const frontHttp = createInstance(import.meta.env.VITE_API_FRONT)

// Seckill 服务（秒杀服务，端口 10007）
export const seckillHttp = createInstance(import.meta.env.VITE_API_SECKILL)

// 默认导出（给不需要区分服务的场景）
export default gatewayHttp
