// 资源访问前缀：本地开发指向 mall-resource(9060)，生产由 Nginx 直接服务 /data/csmall-upload
const RESOURCE_HOST = import.meta.env.VITE_RESOURCE_HOST || 'http://localhost:9060/'

/**
 * 根据数据库中的相对路径构建完整可访问的图片 URL
 * @param {string} rel - 相对路径，如 "spu_1_1.jpg" 或 "picuture/2026/08/03/xxx.jpg"
 * @returns {string} 完整 URL；已带 http 前缀的按原样返回
 */
export function buildImageUrl(rel) {
  if (!rel) return ''
  if (rel.startsWith('http://') || rel.startsWith('https://')) return rel
  return RESOURCE_HOST + rel
}

/**
 * 把上传接口返回的完整 URL 转成入库用的相对路径
 * @param {string} fullUrl - 完整 URL，如 http://localhost:9060/picuture/2026/08/03/xxx.jpg
 * @returns {string} 相对路径，如 picuture/2026/08/03/xxx.jpg
 */
export function toRelativePath(fullUrl) {
  if (!fullUrl) return ''
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) return fullUrl
  try {
    return new URL(fullUrl).pathname.replace(/^\//, '')
  } catch (e) {
    return fullUrl
  }
}
