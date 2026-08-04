<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <span class="hint">系统管理数据由数据库直接维护</span>
        </div>
      </template>
      
      <el-form :inline="true" style="margin-bottom:16px">
        <el-form-item>
          <el-input v-model="searchQuery" placeholder="搜索用户名/昵称" clearable style="width:220px" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button @click="searchQuery='';fetchData()">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enable ? 'success' : 'danger'">{{ row.enable ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :hide-on-single-page="false"
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
import { getAdminList, queryAdmins } from '@/api/sso'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const api = searchQuery.value ? queryAdmins : getAdminList
    const params = { pageNum: page.value, sizeNum: pageSize.value }
    if (searchQuery.value) params.query = searchQuery.value
    const res = await api(params)
    tableData.value = res.data.list || res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error('加载管理员失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
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
  .card-header .el-button {
    width: 100%;
  }
}
</style>
