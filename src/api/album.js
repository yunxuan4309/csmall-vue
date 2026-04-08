import gatewayHttp from './request'

/**
 * 获取相册列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getAlbumList(params) {
  return gatewayHttp.get('/pms/album/list', { params })
}

/**
 * 获取相册详情
 * @param {number} id - 相册ID
 * @returns {Promise}
 */
export function getAlbumDetail(id) {
  return gatewayHttp.get(`/pms/album/${id}`)
}

/**
 * 新增相册
 * @param {Object} data - 相册信息
 * @returns {Promise}
 */
export function addAlbum(data) {
  return gatewayHttp.post('/pms/album/add', data)
}

/**
 * 更新相册
 * @param {number} id - 相册ID
 * @param {Object} data - 相册信息
 * @returns {Promise}
 */
export function updateAlbum(id, data) {
  return gatewayHttp.put(`/pms/album/update/${id}`, data)
}

/**
 * 删除相册
 * @param {number} id - 相册ID
 * @returns {Promise}
 */
export function deleteAlbum(id) {
  return gatewayHttp.delete(`/pms/album/delete/${id}`)
}

/**
 * 上传相册图片
 * @param {FormData} formData - 包含图片文件的 FormData
 * @returns {Promise} 返回图片URL
 */
export function uploadAlbumImage(formData) {
  return gatewayHttp.post('/pms/album/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
