import gatewayHttp from './request'

/**
 * 获取属性模板列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getAttributeTemplateList(params) {
  return gatewayHttp.get('/pms/attribute/template/list', { params })
}

/**
 * 获取属性模板详情
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function getAttributeTemplateDetail(id) {
  return gatewayHttp.get(`/pms/attribute/template/${id}`)
}

/**
 * 新增属性模板
 * @param {Object} data - 模板信息
 * @returns {Promise}
 */
export function addAttributeTemplate(data) {
  return gatewayHttp.post('/pms/attribute/template/add', data)
}

/**
 * 更新属性模板
 * @param {number} id - 模板ID
 * @param {Object} data - 模板信息
 * @returns {Promise}
 */
export function updateAttributeTemplate(id, data) {
  return gatewayHttp.put(`/pms/attribute/template/update/${id}`, data)
}

/**
 * 删除属性模板
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function deleteAttributeTemplate(id) {
  return gatewayHttp.delete(`/pms/attribute/template/delete/${id}`)
}

/**
 * 获取属性列表
 * @param {number} templateId - 模板ID
 * @returns {Promise}
 */
export function getAttributeList(templateId) {
  return gatewayHttp.get(`/pms/attribute/list/${templateId}`)
}
