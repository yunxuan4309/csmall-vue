import gatewayHttp from './request'

/**
 * 上传商品图片（单张）
 * @param {FormData} formData - 包含文件的 FormData，文件字段名固定为 file
 * @returns {Promise} 返回 ImageFileVO（含完整 url）
 */
export function uploadFile(formData) {
  return gatewayHttp.post('/upload/picture/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传品牌 Logo
 * @param {FormData} formData - 包含 file + brandNamePinyin 字段
 * @returns {Promise} 返回 ImageFileVO（含完整 url）
 */
export function uploadBrandLogo(formData) {
  return gatewayHttp.post('/upload/brand-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
