<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="openAdd">新增品牌</el-button>
            <el-button @click="showIdColumn = !showIdColumn" style="margin-left:8px">
              {{ showIdColumn ? '隐藏ID' : '显示ID' }}
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" style="margin-bottom:16px">
        <el-form-item>
          <el-input v-model="searchName" placeholder="搜索品牌名称" clearable style="width:220px" @keyup.enter="page=1;fetchData()" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="page=1;fetchData()">搜索</el-button>
          <el-button @click="searchName='';page=1;fetchData()">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column v-if="showIdColumn" prop="id" label="ID" width="110" />
        <el-table-column label="Logo" width="80">
          <template #default="{ row }">
            <el-image v-if="getLogoUrl(row)" :src="getLogoUrl(row)" fit="cover" style="width:44px;height:44px;border-radius:4px" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品牌名称" />
        <el-table-column prop="pinyin" label="拼音" />
        <el-table-column prop="keywords" label="关键词" show-overflow-tooltip />
        <el-table-column label="启用" width="70">
          <template #default="{ row }">
            <el-tag :type="row.enable === 1 ? 'success' : 'info'">{{ row.enable === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        :total="total"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :hide-on-single-page="false"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增品牌' : '编辑品牌'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="品牌名称" required>
          <el-input v-model="form.name" placeholder="例如：苹果" />
        </el-form-item>
        <el-form-item label="拼音" required>
          <el-input v-model="form.pinyin" placeholder="例如：apple" />
        </el-form-item>
        <el-form-item label="Logo">
          <div style="display:flex;align-items:center;gap:12px">
            <el-upload
              :show-file-list="false"
              :http-request="doUpload"
              accept="image/*"
            >
              <el-button size="small">上传 Logo</el-button>
            </el-upload>
            <el-image v-if="getLogoUrl(form)" :src="getLogoUrl(form)" fit="cover" style="width:44px;height:44px;border-radius:4px" />
            <span v-else style="color:#909399;font-size:12px">未设置</span>
          </div>
        </el-form-item>
        <el-form-item label="简介" required>
          <el-input type="textarea" :rows="2" v-model="form.description" placeholder="一句话品牌简介" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="form.keywords" placeholder="逗号分隔，如：手机,5G" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enable" :active-value="1" :inactive-value="0" />
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
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBrandList, addBrand, updateBrand, deleteBrand } from '@/api/brand'
import { uploadBrandLogo } from '@/api/upload'
import { buildImageUrl, toRelativePath } from '@/utils/image'

const loading = ref(false)
const showIdColumn = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const dialogVisible = ref(false)
const dialogMode = ref('add')
const saving = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', pinyin: '', logo: '', description: '', keywords: '', sort: 0, enable: 1 })

const getLogoUrl = (row) => {
  if (!row?.logo) return ''
  return row.logo.startsWith('http') ? row.logo : buildImageUrl(row.logo)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (searchName.value) params.name = searchName.value
    const res = await getBrandList(params)
    tableData.value = res.data?.list || res.data?.records || []
    total.value = Number(res.data?.total) || 0
  } catch (e) {
    console.error('加载品牌失败', e)
    ElMessage.error('加载品牌失败')
  } finally { loading.value = false }
}

const doUpload = async ({ file, onSuccess, onError }) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('brandNamePinyin', form.pinyin || form.name || 'brand')
  try {
    const res = await uploadBrandLogo(fd)
    const fullUrl = res.data?.url || ''
    form.logo = toRelativePath(fullUrl)
    ElMessage.success('Logo 上传成功')
    onSuccess(res)
  } catch (e) {
    console.error('上传失败', e)
    ElMessage.error('Logo 上传失败')
    onError(e)
  }
}

const openAdd = () => {
  Object.assign(form, { name: '', pinyin: '', logo: '', description: '', keywords: '', sort: 0, enable: 1 })
  dialogMode.value = 'add'
  editingId.value = null
  dialogVisible.value = true
}

const openEdit = async (row) => {
  try {
    const res = await getBrandList({ page: 1, pageSize: 1, name: row.name })
    const item = (res.data?.list || res.data?.records || []).find(b => b.id === row.id) || row
    Object.assign(form, {
      name: item.name || '', pinyin: item.pinyin || '', logo: item.logo || '',
      description: item.description || '', keywords: item.keywords || '',
      sort: item.sort ?? 0, enable: item.enable ?? 1
    })
    dialogMode.value = 'edit'
    editingId.value = row.id
    dialogVisible.value = true
  } catch (e) {
    // fallback: use row data directly
    Object.assign(form, {
      name: row.name || '', pinyin: row.pinyin || '', logo: row.logo || '',
      description: row.description || '', keywords: row.keywords || '',
      sort: row.sort ?? 0, enable: row.enable ?? 1
    })
    dialogMode.value = 'edit'
    editingId.value = row.id
    dialogVisible.value = true
  }
}

const handleSave = async () => {
  if (!form.name) { ElMessage.warning('请填写品牌名称'); return }
  if (!form.pinyin) { ElMessage.warning('请填写拼音'); return }
  if (!form.description) { ElMessage.warning('请填写简介'); return }
  saving.value = true
  try {
    const data = {
      name: form.name, pinyin: form.pinyin, logo: form.logo || '',
      description: form.description, keywords: form.keywords || '', sort: form.sort, enable: form.enable
    }
    if (dialogMode.value === 'add') {
      await addBrand(data)
      ElMessage.success('新增品牌成功')
    } else {
      await updateBrand(editingId.value, data)
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error('保存失败', e)
    ElMessage.error(e?.response?.data?.message || '保存失败')
  } finally { saving.value = false }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除品牌「${row.name}」吗？`, '提示', { type: 'warning' })
    await deleteBrand(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 767px) {
  .card-header { flex-direction: column; gap: 10px; align-items: stretch; }
  .card-header .el-button { width: 100%; }
}
</style>
