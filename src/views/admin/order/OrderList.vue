<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>
      
      <el-form :inline="true" style="margin-bottom: 20px">
        <el-form-item label="订单号">
          <el-input v-model="searchOrderNo" placeholder="请输入订单号" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchStatus" placeholder="请选择" clearable style="width: 130px">
            <el-option label="待付款" :value="0" />
            <el-option label="已支付" :value="3" />
            <el-option label="已签收" :value="4" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchData">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userName" label="客户" width="100" />
        <el-table-column label="金额" width="110">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="showDetail(row.id)">详情</el-button>
            <el-button size="small" type="warning" @click="openStateDialog(row)">状态管理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        :hide-on-single-page="false"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px" destroy-on-close>
      <div v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ detail.sn }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detail.state)">{{ getStatusText(detail.state) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户">{{ detail.contactName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ detail.mobilePhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ detail.provinceName }}{{ detail.cityName }}{{ detail.districtName }} {{ detail.detailedAddress }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">¥{{ detail.amountOfActualPay }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detail.gmtCreate }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 订单状态管理弹窗 -->
    <el-dialog v-model="stateVisible" title="订单状态管理" width="460px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(stateForm.oldState)">{{ getStatusText(stateForm.oldState) }}</el-tag>
        </el-form-item>
        <el-form-item label="目标状态">
          <el-select v-model="stateForm.newState" style="width:100%">
            <el-option v-for="t in allowedTransitions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stateVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingState" @click="doChangeState">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getOrderList, getOrderDetail } from '@/api/order'
import { ORDER_STATUS_TEXT, ORDER_STATUS } from '@/utils/constants'
import gatewayHttp from '@/api/request'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchOrderNo = ref('')
const searchStatus = ref('')
const detailVisible = ref(false)
const detail = ref(null)

const showDetail = async (id) => {
  try {
    const res = await getOrderDetail(id)
    detail.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取订单详情失败')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (searchOrderNo.value) params.sn = searchOrderNo.value
    if (searchStatus.value !== '') params.state = searchStatus.value
    const res = await getOrderList(params)
    tableData.value = (res.data.list || res.data.records || []).map(o => ({
      id: o.id,
      orderNo: o.sn,
      userName: o.userName || o.contactName || '-',
      totalAmount: o.amountOfActualPay,
      status: o.state,
      createTime: o.gmtCreate
    }))
    total.value = res.data.total || 0
  } catch (e) {
    console.error('加载订单失败', e)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchOrderNo.value = ''
  searchStatus.value = ''
  page.value = 1
  fetchData()
}

const getStatusText = (status) => ORDER_STATUS_TEXT[status] || '未知'

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'info', 2: 'info', 3: 'primary', 4: 'success', 5: 'danger', 6: 'warning', 7: 'info' }
  return map[status] || ''
}

// 订单状态管理
const stateVisible = ref(false)
const savingState = ref(false)
const stateForm = reactive({ oldState: 0, newState: 0, orderId: null })
const transitionMap = {
  0: [{ value: 3, label: '已支付' }, { value: 1, label: '已关闭' }, { value: 2, label: '已取消' }],
  3: [{ value: 4, label: '已签收' }, { value: 5, label: '已拒收' }, { value: 6, label: '退款中' }],
  4: [{ value: 5, label: '已拒收' }, { value: 6, label: '退款中' }],
  6: [{ value: 7, label: '已退款' }],
  1: [{ value: 0, label: '重新激活（未支付）' }, { value: 2, label: '已取消' }],
  2: [{ value: 0, label: '重新激活（未支付）' }],
}
const allowedTransitions = computed(() => transitionMap[stateForm.oldState] || [])

const openStateDialog = (row) => {
  stateForm.oldState = row.status
  stateForm.newState = (transitionMap[row.status] || [{}])[0]?.value ?? 0
  stateForm.orderId = row.id
  stateVisible.value = true
}

const doChangeState = async () => {
  if (!stateForm.newState) { ElMessage.warning('请选择目标状态'); return }
  savingState.value = true
  try {
    await gatewayHttp.post('/oms/order/update/state', { id: stateForm.orderId, state: stateForm.newState })
    ElMessage.success('状态修改成功')
    stateVisible.value = false
    fetchData()
  } catch (e) { ElMessage.error(e?.response?.data?.message || '修改失败') } finally { savingState.value = false }
}

onMounted(() => {
  fetchData()
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
  .el-form--inline .el-form-item {
    margin-right: 0;
    width: 100%;
  }
  .el-form--inline .el-form-item .el-input,
  .el-form--inline .el-form-item .el-select {
    width: 100% !important;
  }
  .el-form--inline {
    display: flex;
    flex-direction: column;
  }
}
</style>
