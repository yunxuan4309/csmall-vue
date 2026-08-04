<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" :icon="Plus" @click="openAdd">新增商品</el-button>
        </div>
      </template>

      <el-form :inline="true" style="margin-bottom: 20px" @submit.prevent="search">
        <el-form-item label="关键词">
          <el-input v-model="query.name" placeholder="商品名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
          <el-button :icon="Refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="getFirstPic(row)"
              :src="getFirstPic(row)"
              :preview-src-list="getPicList(row)"
              preview-teleported
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="价格" width="110">
          <template #default="{ row }">¥{{ row.listPrice }}</template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column label="上架" width="80">
          <template #default="{ row }">
            <el-tag :type="row.published === 1 ? 'success' : 'info'">
              {{ row.published === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="80">
          <template #default="{ row }">
            <el-tag :type="row.checked === 1 ? 'success' : 'warning'">
              {{ row.checked === 1 ? '已审核' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="goSku(row)">SKU</el-button>
            <el-button size="small" :type="row.published === 1 ? 'warning' : 'success'" @click="togglePublish(row)">
              {{ row.published === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        :total="total"
        :hide-on-single-page="false"
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增商品' : '编辑商品'" width="760px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="名称" prop="name"><el-input v-model="form.name" placeholder="例如：iPhone 15 Pro" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SPU编号" prop="typeNumber"><el-input v-model="form.typeNumber" :disabled="dialogMode === 'edit'" placeholder="例如：TP-1001（唯一，不可重复）" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标题" prop="title"><el-input v-model="form.title" placeholder="例如：Apple iPhone 15 Pro 256G 原色钛金属" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简介"><el-input type="textarea" :rows="2" v-model="form.description" placeholder="一句话简介，将展示在商品列表" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="listPrice">
              <el-input-number v-model="form.listPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存阈值"><el-input-number v-model="form.stockThreshold" :min="1" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位"><el-input v-model="form.unit" placeholder="例如：件" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brandId">
              <el-select v-model="form.brandId" placeholder="请选择品牌" style="width: 100%">
                <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-cascader
                v-model="form.categoryId"
                :options="categoryOptions"
                :props="cascaderProps"
                placeholder="请选择叶子分类"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="属性模板" prop="attributeTemplateId">
              <el-select v-model="form.attributeTemplateId" placeholder="选择商品规格模板" style="width: 100%">
                <el-option v-for="t in attributeTemplates" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键词"><el-input v-model="form.keywords" placeholder="多个关键词逗号分隔，如：手机,5G" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签"><el-input v-model="form.tags" placeholder="最多3个标签，逗号分隔，如：热销,新品" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商品图片">
              <el-upload
                list-type="picture-card"
                v-model:file-list="pictureList"
                :http-request="doUpload"
                :on-remove="onRemovePic"
                accept="image/*"
                :limit="9"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
          <template v-if="dialogMode === 'edit'">
            <el-col :span="8">
              <el-form-item label="上架"><el-switch v-model="form.published" :active-value="1" :inactive-value="0" /></el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="审核"><el-switch v-model="form.checked" :active-value="1" :inactive-value="0" /></el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="删除标记"><el-switch v-model="form.deleted" :active-value="1" :inactive-value="0" /></el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSpuList, getSpuDetail, addSpu, updateSpu, deleteSpu, updateSpuStatus } from '@/api/spu'
import { getBrandList } from '@/api/brand'
import { getCategoryTree } from '@/api/category'
import { getAttributeTemplateList } from '@/api/attribute'
import { uploadFile } from '@/api/upload'
import { buildImageUrl, toRelativePath } from '@/utils/image'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const total = ref(0)
const brands = ref([])
const categoryTree = ref([])
const attributeTemplates = ref([])

const query = reactive({ name: '', page: 1, pageSize: 10 })

// 表单
const dialogVisible = ref(false)
const dialogMode = ref('add')
const editingId = ref(null)
const originalTemplateId = ref(null)  // 编辑打开时的属性模板ID，用于检测是否变更
const formRef = ref(null)
const form = reactive({
  name: '', typeNumber: '', title: '', description: '', listPrice: 0, stock: 1,
  stockThreshold: 1, unit: '件', brandId: null, categoryId: null,
  attributeTemplateId: 1, albumId: 0, keywords: '', tags: '',
  pictures: '[]', published: 0, checked: 0, deleted: 0, recommend: 0, newArrival: 0, content: ''
})
const picList = ref([])       // 相对路径数组（入库用）
const pictureList = ref([])   // el-upload 展示列表

const cascaderProps = { value: 'id', label: 'name', children: 'children', checkStrictly: false, emitPath: false }
const categoryOptions = computed(() => categoryTree.value)

const rules = {
  name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
  typeNumber: [{ required: true, message: '请填写SPU编号', trigger: 'blur' }],
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  listPrice: [{ required: true, message: '请填写价格', trigger: 'blur' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  attributeTemplateId: [{ required: true, message: '请选择属性模板', trigger: 'change' }]
}

const getFirstPic = (row) => {
  try {
    const pics = JSON.parse(row.pictures || '[]')
    return pics.length ? buildImageUrl(pics[0]) : ''
  } catch { return '' }
}
const getPicList = (row) => {
  try {
    const pics = JSON.parse(row.pictures || '[]')
    return pics.map(buildImageUrl)
  } catch { return [] }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: query.page, pageSize: query.pageSize }
    if (query.name) params.name = query.name
    const res = await getSpuList(params)
    tableData.value = res.data?.list || res.data?.records || []
    total.value = Number(res.data?.total) || 0
  } catch (e) {
    console.error('加载商品失败', e)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

const search = () => { query.page = 1; fetchData() }
const reset = () => { query.name = ''; search() }

const loadOptions = async () => {
  try {
    const bres = await getBrandList({ page: 1, pageSize: 100 })
    brands.value = bres.data?.list || bres.data?.records || []
  } catch (e) { console.error('加载品牌失败', e) }
  try {
    categoryTree.value = await getCategoryTree()
  } catch (e) { console.error('加载分类失败', e) }
  try {
    const tres = await getAttributeTemplateList({ page: 1, pageSize: 100 })
    attributeTemplates.value = tres.data?.list || tres.data?.records || []
  } catch (e) { console.error('加载属性模板失败', e) }
}

const resetForm = () => {
  Object.assign(form, {
    name: '', typeNumber: '', title: '', description: '', listPrice: 0, stock: 1,
    stockThreshold: 1, unit: '件', brandId: null, categoryId: null,
    attributeTemplateId: 1, albumId: 0, keywords: '', tags: '',
    pictures: '[]', published: 0, checked: 0, deleted: 0, recommend: 0, newArrival: 0, content: ''
  })
  picList.value = []
  pictureList.value = []
}

const openAdd = () => {
  resetForm()
  dialogMode.value = 'add'
  editingId.value = null
  dialogVisible.value = true
}

const openEdit = async (row) => {
  try {
    const res = await getSpuDetail(row.id)
    const d = res.data
    Object.assign(form, {
      name: d.name || '', typeNumber: d.typeNumber || '', title: d.title || '',
      description: d.description || '', listPrice: d.listPrice ?? 0, stock: d.stock ?? 0,
      stockThreshold: d.stockThreshold ?? 0, unit: d.unit || '件', brandId: d.brandId ?? null,
      categoryId: d.categoryId ?? null, attributeTemplateId: d.attributeTemplateId ?? 1,
      albumId: d.albumId ?? 0, keywords: d.keywords || '', tags: d.tags || '',
      published: d.published ?? 0, checked: d.checked ?? 0, deleted: d.deleted ?? 0,
      recommend: d.recommend ?? 0, newArrival: d.newArrival ?? 0, content: d.content || ''
    })
    let pics = []
    try { pics = JSON.parse(d.pictures || '[]') } catch { pics = [] }
    picList.value = pics
    pictureList.value = pics.map((p, i) => ({ name: p, url: buildImageUrl(p), uid: i }))
    dialogMode.value = 'edit'
    editingId.value = row.id
    originalTemplateId.value = d.attributeTemplateId ?? null
    dialogVisible.value = true
  } catch (e) {
    console.error('获取详情失败', e)
    ElMessage.error('获取商品详情失败')
  }
}

// 上传图片
const doUpload = async ({ file, onSuccess, onError }) => {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await uploadFile(fd)
    const fullUrl = res.data?.url || ''
    const rel = toRelativePath(fullUrl)
    picList.value.push(rel)
    const target = pictureList.value.find(f => f.uid === file.uid)
    if (target) { target.url = fullUrl; target.name = rel }
    onSuccess(res)
    ElMessage.success('图片上传成功')
  } catch (e) {
    onError(e)
    console.error('图片上传失败', e)
    ElMessage.error('图片上传失败')
  }
}

const onRemovePic = (file) => {
  picList.value = picList.value.filter(p => p !== file.name)
}

const goSku = (row) => {
  router.push(`/admin/product/sku/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除商品「${row.name}」吗？（软删除）`, '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await deleteSpu(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') { console.error(e); ElMessage.error('删除失败') }
  }
}

const togglePublish = async (row) => {
  const target = row.published === 1 ? 0 : 1
  try {
    await updateSpuStatus(row.id, target)
    ElMessage.success(target === 1 ? '已上架' : '已下架')
    fetchData()
  } catch (e) {
    console.error(e)
    ElMessage.error('操作失败')
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  form.pictures = JSON.stringify(picList.value)
  saving.value = true
  try {
    if (dialogMode.value === 'add') {
      // 只发送 SpuAddNewDTO 的字段，多余的字段后端会解析失败
      await addSpu({
        name: form.name, typeNumber: form.typeNumber, title: form.title,
        description: form.description, listPrice: form.listPrice, stock: form.stock,
        stockThreshold: form.stockThreshold, unit: form.unit, brandId: form.brandId,
        categoryId: form.categoryId, attributeTemplateId: form.attributeTemplateId,
        albumId: form.albumId, pictures: form.pictures, keywords: form.keywords,
        tags: form.tags, content: form.content
      })
      ElMessage.success('新增成功')
    } else {
      // 属性模板被更换：弹 10s 倒计时警告，确认才提交（后端会清理旧 SKU）
      const templateChanged = originalTemplateId.value !== null && form.attributeTemplateId !== originalTemplateId.value
      if (templateChanged) {
        const oldTemplate = attributeTemplates.value.find(t => t.id === originalTemplateId.value)?.name || '原模板'
        const newTemplate = attributeTemplates.value.find(t => t.id === form.attributeTemplateId)?.name || '新模板'
        const seconds = ref(10)
        const timer = setInterval(() => { if (seconds.value > 0) seconds.value-- }, 1000)
        try {
          await ElMessageBox({
            title: '更换属性模板警告',
            message: h('div', { style: 'line-height:1.8' }, [
              h('p', null, `属性模板将从「${oldTemplate}」更换为「${newTemplate}」。`),
              h('p', { style: 'color:#e6a23c;font-weight:bold;margin:8px 0' }, '⚠️ 更换模板将删除该商品下所有已生成的 SKU 及规格数据（不可恢复），需重新生成 SKU。'),
              h('p', null, () => `确认更换（${seconds.value}s）`)
            ]),
            confirmButtonText: '确认更换',
            cancelButtonText: '取消',
            type: 'warning',
            showClose: false,
            closeOnClickModal: false,
            beforeClose: (action, instance, done) => {
              if (action === 'confirm') {
                if (seconds.value > 0) {
                  ElMessage.warning(`请等待倒计时结束（剩余 ${seconds.value}s）`)
                  return
                }
                done()
              } else {
                done()
              }
            }
          }).catch(() => {})
        } finally {
          clearInterval(timer)
        }
      }
      // 只发送 SpuUpdateDTO 的字段
      await updateSpu(editingId.value, {
        categoryId: form.categoryId, name: form.name, brandId: form.brandId,
        attributeTemplateId: form.attributeTemplateId, title: form.title,
        description: form.description, published: form.published, checked: form.checked,
        typeNumber: form.typeNumber, recommend: form.recommend, newArrival: form.newArrival,
        deleted: form.deleted, content: form.content,
        listPrice: form.listPrice, stock: form.stock, stockThreshold: form.stockThreshold,
        unit: form.unit, pictures: form.pictures, keywords: form.keywords, tags: form.tags
      })
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error('保存失败', e)
    ElMessage.error(e?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
  loadOptions()
})
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 767px) {
  .card-header { flex-direction: column; gap: 10px; align-items: stretch; }
  .card-header .el-button { width: 100%; }
}
</style>
