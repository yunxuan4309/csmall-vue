<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" :icon="Plus" @click="ElMessage.info('新增商品功能开发中，敬请期待')">新增商品</el-button>
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
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isChecked === 1" type="success">已审核</el-tag>
            <el-tag v-else type="warning">待审核</el-tag>
          </template>
        </el-table-column>
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
        :hide-on-single-page="false"
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import gatewayHttp from '@/api/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const query = reactive({
  name: '',
  page: 1,
  pageSize: 10
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: query.page, pageSize: query.pageSize }
    if (query.name) params.name = query.name
    const res = await gatewayHttp.get('/pms/spu', { params })
    tableData.value = (res.data?.list || res.data?.records || []).map(s => ({
      ...s, price: s.listPrice
    }))
    total.value = res.data?.total || 0
  } catch (e) {
    console.error('加载商品失败', e)
  } finally {
    loading.value = false
  }
}

const search = () => { query.page = 1; fetchData() }
const reset = () => { query.name = ''; search() }

onMounted(fetchData)
</script>
