<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SKU 管理 - {{ spuTitle }}</span>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button :icon="Plus" @click="openAddSku">新增 SKU</el-button>
            <el-button type="primary" :icon="MagicStick" @click="openGenerate">生成 SKU</el-button>
          </div>
        </div>
      </template>

      <!-- 已有 SKU 列表 -->
      <el-table :data="skuList" border stripe v-loading="loading">
        <el-table-column prop="id" label="SKU ID" width="110" />
        <el-table-column label="图片" width="110">
          <template #default="{ row }">
            <el-upload
              :show-file-list="false"
              :http-request="(opts) => uploadSkuPic(row, opts)"
              accept="image/*"
            >
              <el-image
                v-if="getFirstPic(row)"
                :src="getFirstPic(row)"
                :preview-src-list="getPicList(row)"
                preview-teleported
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px; cursor:pointer"
              />
              <el-button v-else size="small" type="text">上传</el-button>
            </el-upload>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="SKU 标题" show-overflow-tooltip />
        <el-table-column label="规格" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.specifications">{{ row.specifications }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="130">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :min="0" :precision="2" size="small" style="width: 100px" @change="saveSku(row)" />
          </template>
        </el-table-column>
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.stock" :min="0" size="small" style="width: 90px" @change="saveSku(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="70" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDeleteSku(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && skuList.length === 0" description="该商品还没有 SKU，点击右上角「生成 SKU」或「新增 SKU」创建" />
    </el-card>

    <!-- 生成 SKU 对话框 -->
    <el-dialog v-model="generateVisible" title="生成 SKU" width="620px" destroy-on-close>
      <div v-if="saleAttributes.length === 0" class="no-attr-tip">
        <el-alert type="warning" :closable="false" title="该商品的属性模板没有销售属性（type=1），无法生成 SKU 组合。" />
      </div>
      <el-form v-else label-width="100px">
        <el-form-item v-for="attr in saleAttributes" :key="attr.id" :label="attr.name">
          <el-checkbox-group v-model="selectedValues[attr.id]">
            <el-checkbox v-for="v in getValues(attr)" :key="v" :label="v">
              {{ v }}<span v-if="attr.unit"> ({{ attr.unit }})</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-alert type="info" :closable="false" title="勾选各属性的可选值，将按笛卡尔积生成 SKU 组合（如 存储×颜色 → 4 个 SKU）。生成后可编辑价格/库存。" />
      </el-form>
      <template #footer>
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" :disabled="!canGenerate" @click="doGenerate">生成</el-button>
      </template>
    </el-dialog>

    <!-- 新增单个 SKU -->
    <el-dialog v-model="addSkuVisible" title="新增 SKU" width="520px" destroy-on-close>
      <el-form :model="addSkuForm" label-width="100px">
        <el-form-item label="SKU 标题" required>
          <el-input v-model="addSkuForm.title" placeholder="例如：iPhone 15 Pro 128GB 深空黑" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number v-model="addSkuForm.price" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="库存" required>
          <el-input-number v-model="addSkuForm.stock" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="条形码">
          <el-input v-model="addSkuForm.barCode" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addSkuVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSku" @click="doAddSku">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MagicStick, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSkuBySpuId, updateSku, generateSkus, addSku, deleteSku } from '@/api/sku'
import { getSpuDetail } from '@/api/spu'
import { getAttributeTemplateDetail } from '@/api/attribute'
import { uploadFile } from '@/api/upload'
import { buildImageUrl, toRelativePath } from '@/utils/image'

const route = useRoute()
const router = useRouter()
// 雪花 ID 是 19 位 Long，JS Number 会丢失精度，必须保持 String
const spuId = route.params.spuId

const spuTitle = ref('')
const loading = ref(false)
const skuList = ref([])

// 生成 SKU
const generateVisible = ref(false)
const generating = ref(false)
const saleAttributes = ref([])   // 销售属性（type=1）
const selectedValues = reactive({})

const getFirstPic = (row) => {
  try {
    const pics = JSON.parse(row.pictures || '[]')
    return pics.length ? buildImageUrl(pics[0]) : ''
  } catch { return '' }
}
const getPicList = (row) => {
  try {
    return (JSON.parse(row.pictures || '[]')).map(buildImageUrl)
  } catch { return [] }
}

// value_list 是 JSON 数组字符串，解析为数组
const getValues = (attr) => {
  try {
    const v = JSON.parse(attr.valueList || '[]')
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

const loadSpu = async () => {
  try {
    const res = await getSpuDetail(spuId)
    spuTitle.value = res.data?.title || res.data?.name || `SPU #${spuId}`
  } catch (e) { console.error('加载SPU失败', e) }
}

const loadSkus = async () => {
  loading.value = true
  try {
    const res = await getSkuBySpuId(spuId, { page: 1, pageSize: 100 })
    skuList.value = res.data?.list || res.data?.records || []
  } catch (e) { console.error('加载SKU失败', e) } finally { loading.value = false }
}

// 新增单个 SKU
const addSkuVisible = ref(false)
const savingSku = ref(false)
const addSkuForm = reactive({ title: '', price: 0, stock: 0, barCode: '' })

const openAddSku = async () => {
  Object.assign(addSkuForm, { title: '', price: 0, stock: 0, barCode: '' })
  addSkuVisible.value = true
}

const doAddSku = async () => {
  if (!addSkuForm.title) { ElMessage.warning('请填写 SKU 标题'); return }
  savingSku.value = true
  try {
    const spuRes = await getSpuDetail(spuId)
    const templateId = spuRes.data?.attributeTemplateId ?? 0
    await addSku({
      spuId, title: addSkuForm.title, barCode: addSkuForm.barCode,
      attributeTemplateId: templateId, albumId: 0, pictures: '[]',
      price: addSkuForm.price, stock: addSkuForm.stock, stockThreshold: 0,
      specifications: null, sort: 0
    })
    ElMessage.success('新增 SKU 成功')
    addSkuVisible.value = false
    loadSkus()
  } catch (e) { console.error(e); ElMessage.error(e?.response?.data?.message || '新增失败') } finally { savingSku.value = false }
}

// 上传 SKU 图片
const uploadSkuPic = async (row, { file, onSuccess, onError }) => {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await uploadFile(fd)
    const fullUrl = res.data?.url || ''
    const rel = toRelativePath(fullUrl)
    // 更新 SKU 图片（保留旧图 + 新图，最多 5 张）
    let pics = []
    try { pics = JSON.parse(row.pictures || '[]') } catch { pics = [] }
    pics.push(rel)
    if (pics.length > 5) pics = pics.slice(-5)
    row.pictures = JSON.stringify(pics)
    await saveSku(row)
    onSuccess(res)
    ElMessage.success('图片上传成功')
  } catch (e) { onError(e); console.error(e); ElMessage.error('图片上传失败') }
}

// 删除 SKU
const handleDeleteSku = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除 SKU「${row.title}」吗？`, '提示', { type: 'warning' })
    await deleteSku(row.id)
    ElMessage.success('删除成功')
    loadSkus()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

const saveSku = async (row) => {
  try {
    await updateSku(row.id, {
      price: row.price, stock: row.stock, stockThreshold: row.stockThreshold ?? 0, sort: row.sort ?? 0,
      title: row.title, pictures: row.pictures
    })
    ElMessage.success('SKU 已保存')
  } catch (e) { console.error('保存SKU失败', e); ElMessage.error('保存失败') }
}

// 打开生成对话框：加载模板销售属性
const openGenerate = async () => {
  generateVisible.value = true
  try {
    const res = await getSpuDetail(spuId)
    const templateId = res.data?.attributeTemplateId
    if (!templateId) {
      saleAttributes.value = []
      return
    }
    const tres = await getAttributeTemplateDetail(templateId)
    const all = tres.data?.attributes || []
    saleAttributes.value = all.filter(a => a.type === 1)  // 只取销售属性
    // 初始化选中值
    for (const attr of saleAttributes.value) {
      if (!selectedValues[attr.id]) selectedValues[attr.id] = []
    }
  } catch (e) {
    console.error('加载属性模板失败', e)
    saleAttributes.value = []
    ElMessage.error('加载属性模板失败')
  }
}

const canGenerate = computed(() => {
  return saleAttributes.value.length > 0 && saleAttributes.value.some(attr => (selectedValues[attr.id] || []).length > 0)
})

const doGenerate = async () => {
  const attributes = saleAttributes.value
    .filter(attr => (selectedValues[attr.id] || []).length > 0)
    .map(attr => ({ attributeId: attr.id, attributeName: attr.name, values: selectedValues[attr.id] }))
  generating.value = true
  try {
    const res = await generateSkus({ spuId, attributes })
    ElMessage.success(`已生成 ${res.data} 个 SKU`)
    generateVisible.value = false
    loadSkus()
  } catch (e) {
    console.error('生成SKU失败', e)
    ElMessage.error(e?.response?.data?.message || '生成SKU失败')
  } finally { generating.value = false }
}

onMounted(() => { loadSpu(); loadSkus() })
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.no-attr-tip { padding: 20px; }

@media (max-width: 767px) {
  .card-header { flex-direction: column; gap: 10px; align-items: stretch; }
}
</style>
