import { umsHttp } from './request'

/**
 * 检查用户名/手机号/邮箱是否重复
 * @param {string} value - 待校验的值
 * @param {string} type - 校验类型：'phone' | 'username' | 'email'
 * @returns {Promise} 成功表示未重复，失败表示已重复
 */
export function checkValue(value, type) {
  const params = new URLSearchParams()
  params.append('value', value)
  params.append('type', type)
  
  return umsHttp.post('/ums/user/checkValue', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 登录用户名（4~16位字母数字，首字符为字母）
 * @param {string} data.nickname - 昵称（2~16个字符）
 * @param {string} data.password - 密码（4~16位可打印ASCII字符）
 * @param {string} data.ackPassword - 确认密码（需与 password 一致）
 * @param {string} data.email - 邮箱（标准邮箱格式）
 * @param {string} data.phone - 手机号（11位手机号，1开头）
 * @returns {Promise}
 */
export function userRegister(data) {
  return umsHttp.post('/ums/user/register', data)
}
