import gatewayHttp from './request'

/**
 * 文件上传
 * @param {FormData} formData - 包含文件的 FormData
 * @param {string} type - 上传类型：'image' | 'file' | 'video'
 * @returns {Promise} 返回文件URL
 */
export function uploadFile(formData, type = 'image') {
  return gatewayHttp.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量文件上传
 * @param {FormData} formData - 包含多个文件的 FormData
 * @param {string} type - 上传类型：'image' | 'file' | 'video'
 * @returns {Promise} 返回文件URL数组
 */
export function uploadFiles(formData, type = 'image') {
  return gatewayHttp.post(`/upload/${type}/batch`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除已上传的文件
 * @param {string} fileUrl - 文件URL
 * @returns {Promise}
 */
export function deleteFile(fileUrl) {
  return gatewayHttp.delete('/upload/delete', {
    params: { fileUrl }
  })
}
