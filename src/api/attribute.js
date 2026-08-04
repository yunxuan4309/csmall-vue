import gatewayHttp from './request'

// ==================== 属性模板 ====================

/**
 * 获取属性模板列表（分页）
 * @param {Object} params - 查询参数 { page, pageSize }
 * @returns {Promise}
 */
export function getAttributeTemplateList(params) {
  return gatewayHttp.get('/pms/attribute-templates', { params })
}

/**
 * 获取属性模板详情（含属性列表）
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function getAttributeTemplateDetail(id) {
  return gatewayHttp.get(`/pms/attribute-templates/${id}/details`)
}

/**
 * 新增属性模板
 * @param {Object} data - 模板信息 { categoryId, name, pinyin, keywords, sort }
 * @returns {Promise}
 */
export function addAttributeTemplate(data) {
  return gatewayHttp.post('/pms/attribute-templates/addnew', data)
}

/**
 * 更新属性模板
 * @param {number} id - 模板ID
 * @param {Object} data - 模板信息
 * @returns {Promise}
 */
export function updateAttributeTemplate(id, data) {
  return gatewayHttp.post(`/pms/attribute-templates/${id}/update`, data)
}

/**
 * 删除属性模板
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function deleteAttributeTemplate(id) {
  return gatewayHttp.post(`/pms/attribute-templates/${id}/delete`)
}

// ==================== 属性 ====================

/**
 * 获取某模板下的属性列表
 * @param {number} templateId - 模板ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getAttributeList(templateId, params) {
  return gatewayHttp.get('/pms/attributes', { params: { templateId, ...params } })
}

/**
 * 新增属性
 * @param {Object} data - 属性信息 { templateId, name, description, type, inputType, valueList, unit, sort, allowCustomize }
 * @returns {Promise}
 */
export function addAttribute(data) {
  return gatewayHttp.post('/pms/attributes/addnew', data)
}

/**
 * 更新属性
 * @param {number} id - 属性ID
 * @param {Object} data - 属性信息
 * @returns {Promise}
 */
export function updateAttribute(id, data) {
  return gatewayHttp.post(`/pms/attributes/${id}/update`, data)
}

/**
 * 删除属性
 * @param {number} id - 属性ID
 * @returns {Promise}
 */
export function deleteAttribute(id) {
  return gatewayHttp.post(`/pms/attributes/${id}/delete`)
}
