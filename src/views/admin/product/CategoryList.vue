<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" :icon="Plus">新增分类</el-button>
        </div>
      </template>

      <el-table
        :data="categoryTree"
        border stripe
        row-key="id"
        v-loading="loading"
        default-expand-all
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="depth" label="层级" width="80" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="isParent" label="父级分类" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isParent === 1" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.enable === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import gatewayHttp from '@/api/request'

const loading = ref(false)
const categoryTree = ref([])

// 递归加载子分类，构建树形结构
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

onMounted(async () => {
  loading.value = true
  try {
    categoryTree.value = await loadChildren(0)
  } catch (e) {
    console.error('加载分类失败', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 767px) {
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}
</style>
