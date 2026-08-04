<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="openAdd">新增分类</el-button>
            <el-button @click="showIdColumn = !showIdColumn" style="margin-left:8px">
              {{ showIdColumn ? '隐藏ID' : '显示ID' }}
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="categoryTree" border stripe row-key="id" v-loading="loading" default-expand-all>
        <el-table-column v-if="showIdColumn" prop="id" label="ID" width="110" />
        <el-table-column label="图标" width="70">
          <template #default="{ row }">
            <el-image v-if="getIconUrl(row)" :src="getIconUrl(row)" fit="cover" style="width:32px;height:32px;border-radius:3px" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="depth" label="层级" width="70" />
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="父级" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isParent === 1" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="70">
          <template #default="{ row }">
            <el-tag :type="row.enable === 1 ? 'success' : 'danger'">{{ row.enable === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.enable === 1 ? 'warning' : 'success'" @click="toggleEnable(row)">
              {{ row.enable === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增分类' : '编辑分类'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="父级分类" v-if="dialogMode === 'add'">
          <el-cascader v-model="form.parentId" :options="categoryOptions" :props="{ value:'id', label:'name', children:'children', checkStrictly:true, emitPath:false }" placeholder="留空=顶级分类" style="width:100%" clearable />
        </el-form-item>
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="例如：手机" />
        </el-form-item>
        <el-form-item label="图标">
          <div style="display:flex;align-items:center;gap:12px">
            <el-upload :show-file-list="false" :http-request="doUpload" accept="image/png">
              <el-button size="small">上传图标</el-button>
            </el-upload>
            <el-image v-if="getIconUrl(form)" :src="getIconUrl(form)" fit="cover" style="width:32px;height:32px;border-radius:3px" />
          </div>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="form.keywords" placeholder="逗号分隔" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enable" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="导航显示">
          <el-switch v-model="form.display" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/category'
import { buildImageUrl, toRelativePath } from '@/utils/image'
import gatewayHttp from '@/api/request'

const loading = ref(false)
const showIdColumn = ref(false)
const categoryTree = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const editingId = ref(null)
const form = reactive({ parentId: null, name: '', keywords: '', icon: '', sort: 0, enable: 1, display: 1 })

const getIconUrl = (row) => { if (!row?.icon) return ''; return row.icon.startsWith('http') ? row.icon : buildImageUrl(row.icon) }

// Recursive category tree
const loadChildren = async (parentId = 0) => {
  const res = await getCategoryList(parentId)
  const list = res.data?.list || res.data?.records || []
  const result = []
  for (const item of list) {
    const node = { ...item, children: [] }
    if (item.isParent === 1 || item.depth < 2) node.children = await loadChildren(item.id)
    result.push(node)
  }
  return result
}

const fetchData = async () => {
  loading.value = true
  try { categoryTree.value = await loadChildren(0) } catch (e) { console.error(e) } finally { loading.value = false }
}

// Category tree flattened for parent selector
const flattenTree = (tree, prefix = '') => {
  let result = []
  for (const node of tree) {
    result.push({ ...node, name: prefix + node.name, children: node.children?.length ? flattenTree(node.children, prefix + '  ') : [] })
  }
  return result
}
const categoryOptions = computed(() => flattenTree(JSON.parse(JSON.stringify(categoryTree.value))))

const openAdd = () => {
  Object.assign(form, { parentId: null, name: '', keywords: '', icon: '', sort: 0, enable: 1, display: 1 })
  dialogMode.value = 'add'; editingId.value = null; dialogVisible.value = true
}

const openEdit = (row) => {
  Object.assign(form, {
    parentId: row.parentId || null, name: row.name || '', keywords: row.keywords || '',
    icon: row.icon || '', sort: row.sort ?? 0, enable: row.enable ?? 1, display: row.display ?? 1
  })
  dialogMode.value = 'edit'; editingId.value = row.id; dialogVisible.value = true
}

const doUpload = async ({ file, onSuccess, onError }) => {
  const fd = new FormData(); fd.append('file', file); fd.append('categoryNamePinyin', form.name)
  try {
    const res = await gatewayHttp.post('/upload/category-icon', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    form.icon = toRelativePath(res.data?.url || '')
    ElMessage.success('图标上传成功'); onSuccess(res)
  } catch (e) { console.error(e); ElMessage.error('上传失败'); onError(e) }
}

const handleSave = async () => {
  if (!form.name) { ElMessage.warning('请填写分类名称'); return }
  saving.value = true
  try {
    const data = { name: form.name, keywords: form.keywords || '', icon: form.icon || '', sort: form.sort, enable: form.enable, display: form.display }
    if (dialogMode.value === 'add') {
      await addCategory({ ...data, parentId: form.parentId || 0 })
      ElMessage.success('新增分类成功')
    } else {
      await updateCategory(editingId.value, data)
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false; fetchData()
  } catch (e) { console.error(e); ElMessage.error(e?.response?.data?.message || '保存失败') } finally { saving.value = false }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '提示', { type: 'warning' })
    await deleteCategory(row.id)
    ElMessage.success('删除成功'); fetchData()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

const toggleEnable = async (row) => {
  const url = row.enable === 1 ? `/pms/categories/${row.id}/status/disable` : `/pms/categories/${row.id}/status/enable`
  try { await gatewayHttp.post(url); ElMessage.success(row.enable === 1 ? '已禁用' : '已启用'); fetchData() }
  catch (e) { console.error(e); ElMessage.error('操作失败') }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
@media (max-width: 767px) { .card-header { flex-direction: column; gap: 10px; align-items: stretch; } }
</style>
