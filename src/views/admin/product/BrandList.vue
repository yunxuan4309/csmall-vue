<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <el-button type="primary" :icon="Plus">新增品牌</el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="品牌名称" />
        <el-table-column label="品牌Logo" width="100">
          <template #default="{ row }">
            <el-avatar v-if="row.logo" shape="square" :size="40" :src="row.logo" />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        :total="total"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import gatewayHttp from '@/api/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await gatewayHttp.get('/pms/brands', {
      params: { page: page.value, pageSize: pageSize.value }
    })
    tableData.value = res.data?.list || res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error('加载品牌失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 767px) {
  .card-header { flex-direction: column; gap: 10px; align-items: stretch; }
  .card-header .el-button { width: 100%; }
}
</style>
