import { frontHttp, gatewayHttp } from './request'

/**
 * 获取前台分类树（递归结构）
 * @returns {Promise} 返回 { categories: [] }
 */
export function getFrontCategoryTree() {
  return frontHttp.get('/front/category/all')
}

/**
 * 递归加载子分类（内部工具，后台管理树构建用）
 */
const loadChildren = async (parentId = 0) => {
  const res = await gatewayHttp.get('/pms/categories/list-by-parent', {
    params: { parentId, page: 1, pageSize: 100 }
  })
  const list = res.data?.list || res.data?.records || []
  const result = []
  for (const item of list) {
    const node = { ...item, children: [] }
    if (item.isParent === 1 || item.depth < 2) {
      node.children = await loadChildren(item.id)
    }
    result.push(node)
  }
  return result
}

/**
 * 获取分类列表（后台管理用，按父级查子级）
 * @param {number} parentId - 父分类ID，默认0表示根分类
 * @returns {Promise}
 */
export function getCategoryList(parentId = 0) {
  return gatewayHttp.get('/pms/categories/list-by-parent', {
    params: { parentId }
  })
}

/**
 * 获取分类树（后台管理用，递归构建）
 * @returns {Promise} 返回分类树数组
 */
export async function getCategoryTree() {
  return loadChildren(0)
}

/**
 * 新增分类
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export function addCategory(data) {
  return gatewayHttp.post('/pms/categories/addnew', data)
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return gatewayHttp.post(`/pms/categories/${id}/full-info/update`, data)
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return gatewayHttp.post(`/pms/categories/${id}/delete`)
}
