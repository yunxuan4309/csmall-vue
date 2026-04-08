// ============ API 相关常量 ============

/** Token 在 localStorage 中的 key */
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'mall_token'

/** Token 前缀 */
export const TOKEN_PREFIX = import.meta.env.VITE_TOKEN_PREFIX || 'Bearer'

/** Token 有效期（秒）*/
export const TOKEN_EXPIRATION = parseInt(import.meta.env.VITE_TOKEN_EXPIRATION) || 604800

// ============ 业务常量 ============

/** 分页默认配置 */
export const DEFAULT_PAGE = {
  page: 1,
  pageSize: 10
}

/** 分页大小选项 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 订单状态枚举 */
export const ORDER_STATUS = {
  PENDING: 0,      // 待付款
  PAID: 1,         // 已付款
  SHIPPED: 2,      // 已发货
  RECEIVED: 3,     // 已收货
  CANCELLED: 4,    // 已取消
  REFUNDED: 5      // 已退款
}

/** 订单状态文本映射 */
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待付款',
  [ORDER_STATUS.PAID]: '已付款',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.RECEIVED]: '已收货',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

/** SPU 状态枚举 */
export const SPU_STATUS = {
  OFF_SHELF: 0,  // 下架
  ON_SHELF: 1    // 上架
}

/** SPU 状态文本映射 */
export const SPU_STATUS_TEXT = {
  [SPU_STATUS.OFF_SHELF]: '下架',
  [SPU_STATUS.ON_SHELF]: '上架'
}

/** 校验类型枚举 */
export const CHECK_TYPE = {
  USERNAME: 'username',
  PHONE: 'phone',
  EMAIL: 'email'
}

/** 上传文件类型 */
export const UPLOAD_TYPE = {
  IMAGE: 'image',
  FILE: 'file',
  VIDEO: 'video'
}

// ============ 正则表达式 ============

/** 用户名正则：4~16位字母数字，首字符必须为字母 */
export const REGEX_USERNAME = /^[a-zA-Z][0-9a-zA-Z]{3,15}$/

/** 密码正则：4~16位可打印ASCII字符 */
export const REGEX_PASSWORD = /^[\u0020-\u007e]{4,16}$/

/** 昵称正则：2~16个字符 */
export const REGEX_NICKNAME = /^.{2,16}$/

/** 邮箱正则 */
export const REGEX_EMAIL = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

/** 手机号正则：11位手机号，1开头 */
export const REGEX_PHONE = /^1[34589]\d{9}$/
