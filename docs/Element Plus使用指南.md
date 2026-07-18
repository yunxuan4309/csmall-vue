# Element Plus 使用指南

## 📦 安装

```bash
npm install element-plus @element-plus/icons-vue
```

## ⚙️ 配置

已在 `src/main.js` 中完成全局配置：
- ✅ 引入 Element Plus 样式
- ✅ 注册所有图标组件
- ✅ 配置中文语言包

## 🎨 常用组件示例

### 1. 按钮 (Button)

```vue
<template>
  <el-button type="primary">主要按钮</el-button>
  <el-button type="success" :icon="Check">带图标</el-button>
  <el-button type="danger" loading>加载中</el-button>
  <el-button disabled>禁用</el-button>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'
</script>
```

### 2. 表单 (Form)

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>
    
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="form.password" 
        type="password" 
        show-password
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
  ]
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('验证通过')
    } else {
      ElMessage.error('验证失败')
    }
  })
}
</script>
```

### 3. 表格 (Table)

```vue
<template>
  <el-table :data="tableData" border stripe>
    <el-table-column prop="date" label="日期" width="180" />
    <el-table-column prop="name" label="姓名" width="180" />
    <el-table-column prop="address" label="地址" />
    <el-table-column label="操作" width="150">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row)">
          编辑
        </el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  
  <!-- 分页 -->
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
  />
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const handleEdit = (row) => {
  console.log('编辑', row)
}

const handleDelete = (row) => {
  console.log('删除', row)
}
</script>
```

### 4. 对话框 (Dialog)

```vue
<template>
  <el-button @click="dialogVisible = true">打开对话框</el-button>
  
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="500px"
  >
    <span>这是对话框内容</span>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

const handleConfirm = () => {
  dialogVisible.value = false
}
</script>
```

### 5. 消息提示

```javascript
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

// 普通消息
ElMessage.success('成功消息')
ElMessage.error('错误消息')
ElMessage.warning('警告消息')
ElMessage.info('信息消息')

// 确认对话框
ElMessageBox.confirm(
  '确定要删除吗？',
  '提示',
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
    ElMessage.info('已取消')
  })

// 通知
ElNotification({
  title: '通知',
  message: '这是一条通知消息',
  type: 'success',
  duration: 3000,
})
```

### 6. 下拉选择 (Select)

```vue
<template>
  <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = ref([
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' }
])
</script>
```

### 7. 日期选择器 (DatePicker)

```vue
<template>
  <el-date-picker
    v-model="date"
    type="date"
    placeholder="选择日期"
    format="YYYY-MM-DD"
    value-format="YYYY-MM-DD"
  />
  
  <el-date-picker
    v-model="dateRange"
    type="daterange"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>

<script setup>
import { ref } from 'vue'

const date = ref('')
const dateRange = ref([])
</script>
```

### 8. 上传组件 (Upload)

```vue
<template>
  <el-upload
    action="/api/upload/image"
    :headers="uploadHeaders"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
  >
    <el-button type="primary">点击上传</el-button>
  </el-upload>
</template>

<script setup>
import { computed } from 'vue'

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('mall_token')}`
}))

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
  }
  
  return isImage && isLt2M
}

const handleSuccess = (response) => {
  ElMessage.success('上传成功')
  console.log(response)
}
</script>
```

## 🎯 结合 API 使用的完整示例

```vue
<template>
  <div class="admin-list">
    <!-- 搜索栏 -->
    <el-card style="margin-bottom: 20px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="请输入关键词"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table 
        :data="tableData" 
        v-loading="loading"
        border 
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
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

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getAdminList, deleteAdmin } from '@/api'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({
  keyword: ''
})
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  pagination.page = 1
  fetchData()
}

// 编辑
const handleEdit = (row) => {
  console.log('编辑', row)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除管理员 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteAdmin(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>
```

## 📚 更多资源

- Element Plus 官方文档: https://element-plus.org/zh-CN/
- Element Plus Icons: https://element-plus.org/zh-CN/component/icon.html
- 查看演示文件: `src/views/ElementPlusDemo.vue`
