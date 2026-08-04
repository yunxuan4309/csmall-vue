<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>属性模板管理</span>
          <el-button type="primary" :icon="Plus" @click="openAddTemplate">新增模板</el-button>
        </div>
      </template>

      <el-table :data="templates" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="110" />
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="pinyin" label="拼音" />
        <el-table-column prop="keywords" label="关键词" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="属性数" width="80">
          <template #default="{ row }">{{ row.attributeCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDetail(row)">管理属性</el-button>
            <el-button size="small" @click="openEditTemplate(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteTemplate(row)">删除</el-button>
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
        @current-change="fetchTemplates"
        @size-change="fetchTemplates"
      />
    </el-card>

    <!-- 新增/编辑模板弹窗 -->
    <el-dialog v-model="templateDialogVisible" :title="templateMode === 'add' ? '新增模板' : '编辑模板'" width="480px" destroy-on-close>
      <el-form :model="templateForm" label-width="90px">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateForm.name" placeholder="例如：手机参数" />
        </el-form-item>
        <el-form-item label="拼音">
          <el-input v-model="templateForm.pinyin" placeholder="例如：shouji" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="templateForm.keywords" placeholder="逗号分隔" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="templateForm.sort" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item v-if="templateMode === 'add'" label="关联分类" required>
          <el-select v-model="templateForm.categoryId" placeholder="选择叶子分类" style="width:100%">
            <el-option v-for="c in leafCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 模板详情：属性管理 -->
    <el-dialog v-model="detailVisible" :title="`模板属性 - ${currentTemplate?.name || ''}`" width="760px" destroy-on-close>
      <el-table :data="attributes" border stripe v-loading="detailLoading">
        <el-table-column prop="name" label="属性名" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ row.type === 1 ? '销售' : '参数' }}</template>
        </el-table-column>
        <el-table-column label="输入类型" width="100">
          <template #default="{ row }">{{ inputTypeText(row.inputType) }}</template>
        </el-table-column>
        <el-table-column label="可选值" show-overflow-tooltip>
          <template #default="{ row }">{{ formatValueList(row.valueList) }}</template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditAttr(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteAttr(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:16px">
        <el-button type="primary" :icon="Plus" @click="openAddAttr">新增属性</el-button>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑属性弹窗 -->
    <el-dialog v-model="attrDialogVisible" :title="attrMode === 'add' ? '新增属性' : '编辑属性'" width="520px" destroy-on-close>
      <el-form :model="attrForm" label-width="90px">
        <el-form-item label="属性名" required>
          <el-input v-model="attrForm.name" placeholder="例如：存储容量" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-radio-group v-model="attrForm.type">
            <el-radio :value="1">销售属性（生成SKU）</el-radio>
            <el-radio :value="0">参数属性</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="输入类型">
          <el-select v-model="attrForm.inputType" style="width:100%">
            <el-option :value="0" label="手动录入" />
            <el-option :value="1" label="单选" />
            <el-option :value="2" label="多选" />
            <el-option :value="3" label="单选下拉" />
            <el-option :value="4" label="多选下拉" />
          </el-select>
        </el-form-item>
        <el-form-item label="可选值">
          <el-input type="textarea" :rows="3" v-model="attrForm.valueListText" placeholder='JSON 数组，如 ["128GB","256GB","512GB"]' />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="attrForm.unit" placeholder="例如：GB" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="attrForm.sort" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="允许自定义">
          <el-switch v-model="attrForm.allowCustomize" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="attrDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingAttr" @click="saveAttr">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAttributeTemplateList, addAttributeTemplate, updateAttributeTemplate, deleteAttributeTemplate,
  getAttributeTemplateDetail, getAttributeList, addAttribute, updateAttribute, deleteAttribute
} from '@/api/attribute'
import { getCategoryList } from '@/api/category'

const loading = ref(false)
const templates = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 模板弹窗
const templateDialogVisible = ref(false)
const templateMode = ref('add')
const templateForm = reactive({ id: null, name: '', pinyin: '', keywords: '', sort: 0, categoryId: null })
const leafCategories = ref([])
const saving = ref(false)

// 详情（属性管理）
const detailVisible = ref(false)
const currentTemplate = ref(null)
const attributes = ref([])
const detailLoading = ref(false)

// 属性弹窗
const attrDialogVisible = ref(false)
const attrMode = ref('add')
const attrForm = reactive({
  id: null, templateId: null, name: '', type: 1, inputType: 0,
  valueListText: '', unit: '', sort: 0, allowCustomize: 0
})
const savingAttr = ref(false)

const fetchTemplates = async () => {
  loading.value = true
  try {
    const res = await getAttributeTemplateList({ page: page.value, pageSize: pageSize.value })
    templates.value = res.data?.list || res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e) { console.error('加载模板失败', e); ElMessage.error('加载模板失败') } finally { loading.value = false }
}

const loadLeafCategories = async () => {
  try {
    // 递归加载分类树，取叶子（isParent=0）
    const loadChildren = async (parentId = 0) => {
      const res = await getCategoryList(parentId)
      const list = res.data?.list || res.data?.records || []
      const result = []
      for (const item of list) {
        if (item.isParent === 0) {
          result.push(item)
        } else {
          result.push(...await loadChildren(item.id))
        }
      }
      return result
    }
    leafCategories.value = await loadChildren(0)
  } catch (e) { console.error('加载分类失败', e) }
}

const openAddTemplate = async () => {
  Object.assign(templateForm, { id: null, name: '', pinyin: '', keywords: '', sort: 0, categoryId: null })
  templateMode.value = 'add'
  if (leafCategories.value.length === 0) await loadLeafCategories()
  templateDialogVisible.value = true
}

const openEditTemplate = (row) => {
  Object.assign(templateForm, { id: row.id, name: row.name || '', pinyin: row.pinyin || '', keywords: row.keywords || '', sort: row.sort || 0, categoryId: null })
  templateMode.value = 'edit'
  templateDialogVisible.value = true
}

const saveTemplate = async () => {
  if (!templateForm.name) { ElMessage.warning('请填写模板名称'); return }
  saving.value = true
  try {
    if (templateMode.value === 'add') {
      if (!templateForm.categoryId) { ElMessage.warning('请选择关联分类'); return }
      await addAttributeTemplate({ name: templateForm.name, pinyin: templateForm.pinyin, keywords: templateForm.keywords, sort: templateForm.sort, categoryId: templateForm.categoryId })
      ElMessage.success('新增模板成功')
    } else {
      await updateAttributeTemplate(templateForm.id, { name: templateForm.name, pinyin: templateForm.pinyin, keywords: templateForm.keywords, sort: templateForm.sort })
      ElMessage.success('保存成功')
    }
    templateDialogVisible.value = false
    fetchTemplates()
  } catch (e) { console.error(e); ElMessage.error(e?.response?.data?.message || '保存失败') } finally { saving.value = false }
}

const handleDeleteTemplate = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除模板「${row.name}」吗？`, '提示', { type: 'warning' })
    await deleteAttributeTemplate(row.id)
    ElMessage.success('删除成功')
    fetchTemplates()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

const inputTypeText = (t) => ({ 0: '手动', 1: '单选', 2: '多选', 3: '单选下拉', 4: '多选下拉' })[t] ?? '未知'
const formatValueList = (v) => {
  try { const arr = JSON.parse(v || '[]'); return Array.isArray(arr) ? arr.join(', ') : '' } catch { return '' }
}

const openDetail = async (row) => {
  currentTemplate.value = row
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getAttributeTemplateDetail(row.id)
    attributes.value = res.data?.attributes || []
  } catch (e) { console.error('加载模板详情失败', e); ElMessage.error('加载模板详情失败') } finally { detailLoading.value = false }
}

const openAddAttr = () => {
  Object.assign(attrForm, { id: null, templateId: currentTemplate.value?.id, name: '', type: 1, inputType: 0, valueListText: '', unit: '', sort: 0, allowCustomize: 0 })
  attrMode.value = 'add'
  attrDialogVisible.value = true
}

const openEditAttr = (row) => {
  Object.assign(attrForm, {
    id: row.id, templateId: currentTemplate.value?.id, name: row.name || '',
    type: row.type ?? 1, inputType: row.inputType ?? 0,
    valueListText: row.valueList || '', unit: row.unit || '', sort: row.sort || 0, allowCustomize: row.allowCustomize ?? 0
  })
  attrMode.value = 'edit'
  attrDialogVisible.value = true
}

const saveAttr = async () => {
  if (!attrForm.name) { ElMessage.warning('请填写属性名'); return }
  savingAttr.value = true
  try {
    const data = {
      templateId: attrForm.templateId, name: attrForm.name, type: attrForm.type,
      inputType: attrForm.inputType, valueList: attrForm.valueListText, unit: attrForm.unit,
      sort: attrForm.sort, allowCustomize: attrForm.allowCustomize
    }
    if (attrMode.value === 'add') {
      await addAttribute(data)
      ElMessage.success('新增属性成功')
    } else {
      await updateAttribute(attrForm.id, data)
      ElMessage.success('保存成功')
    }
    attrDialogVisible.value = false
    if (currentTemplate.value) openDetail(currentTemplate.value)
  } catch (e) { console.error(e); ElMessage.error(e?.response?.data?.message || '保存失败') } finally { savingAttr.value = false }
}

const handleDeleteAttr = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除属性「${row.name}」吗？`, '提示', { type: 'warning' })
    await deleteAttribute(row.id)
    ElMessage.success('删除成功')
    if (currentTemplate.value) openDetail(currentTemplate.value)
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => {
  fetchTemplates()
  loadLeafCategories()
})
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 767px) {
  .card-header { flex-direction: column; gap: 10px; align-items: stretch; }
}
</style>
