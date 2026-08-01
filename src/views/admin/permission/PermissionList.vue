<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" :icon="Plus">新增权限</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" border stripe row-key="id">
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="value" label="权限编码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button size="small" type="primary" @click="ElMessage.info('编辑功能开发中，敬请期待')">编辑</el-button>
            <el-button size="small" type="danger" @click="ElMessage.info('删除功能开发中，敬请期待')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top:20px;justify-content:flex-end"
        v-model:current-page="page" v-model:page-size="pageSize"
        :total="total" :page-sizes="[10,20,50]" :hide-on-single-page="false"
        layout="total,sizes,prev,pager,next" @current-change="fetchData" @size-change="fetchData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { getPermissionList } from '@/api/sso'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPermissionList({ pageNum: page.value, sizeNum: pageSize.value })
    tableData.value = res.data.list || res.data.records || []
    total.value = Number(res.data.total) || 0
  } catch (e) {
    console.error('加载权限失败', e)
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
