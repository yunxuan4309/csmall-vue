<template>
  <div class="element-plus-demo">
    <h2>Element Plus 使用示例</h2>

    <!-- 按钮组件 -->
    <el-row :gutter="10" style="margin-bottom: 20px">
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
      <el-button type="info">信息按钮</el-button>
    </el-row>

    <!-- 带图标的按钮 -->
    <el-row :gutter="10" style="margin-bottom: 20px">
      <el-button type="primary" :icon="Search">搜索</el-button>
      <el-button type="success" :icon="Check">确认</el-button>
      <el-button type="danger" :icon="Delete">删除</el-button>
    </el-row>

    <!-- 表单组件 -->
    <el-card style="max-width: 600px; margin-bottom: 20px">
      <template #header>
        <span>登录表单示例</span>
      </template>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格组件 -->
    <el-card style="margin-bottom: 20px">
      <template #header>
        <span>数据表示例</span>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="100"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 消息提示示例 -->
    <el-row :gutter="10" style="margin-top: 20px">
      <el-button @click="showMessage">消息提示</el-button>
      <el-button @click="showAlert">警告提示</el-button>
      <el-button @click="showConfirm">确认对话框</el-button>
      <el-button @click="showNotification">通知</el-button>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { 
  Search, 
  Check, 
  Delete, 
  User, 
  Lock 
} from '@element-plus/icons-vue'

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
})

// 表格数据
const tableData = ref([
  {
    date: '2024-01-01',
    name: '张三',
    address: '北京市朝阳区'
  },
  {
    date: '2024-01-02',
    name: '李四',
    address: '上海市浦东新区'
  },
  {
    date: '2024-01-03',
    name: '王五',
    address: '广州市天河区'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 登录处理
const handleLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  
  ElMessage.success('登录成功！')
  console.log('登录信息:', loginForm.value)
}

// 重置表单
const resetForm = () => {
  loginForm.value = {
    username: '',
    password: ''
  }
  ElMessage.info('表单已重置')
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑: ${row.name}`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 分页变化
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}

// 消息提示
const showMessage = () => {
  ElMessage.success('这是一条成功的消息提示')
}

const showAlert = () => {
  ElMessage.warning('这是一条警告消息')
}

const showConfirm = () => {
  ElMessageBox.confirm(
    '这是确认对话框的内容',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      ElMessage.success('点击了确定')
    })
    .catch(() => {
      ElMessage.info('点击了取消')
    })
}

const showNotification = () => {
  ElNotification({
    title: '通知',
    message: '这是一条通知消息',
    type: 'success',
  })
}
</script>

<style scoped>
.element-plus-demo {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}
</style>
