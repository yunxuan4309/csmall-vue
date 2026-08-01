<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <el-button type="primary" :icon="Plus" @click="ElMessage.info('新增品牌功能开发中，敬请期待')">新增品牌</el-button>
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
            <el-button size="small" type="primary" @click="ElMessage.info('编辑功能开发中，敬请期待')">编辑</el-button>
            <el-button size="small" type="danger" @click="ElMessage.info('删除功能开发中，敬请期待')">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import gatewayHttp from '@/api/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (searchName.value) params.name = searchName.value
    const res = await gatewayHttp.get('/pms/brands', { params })
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
