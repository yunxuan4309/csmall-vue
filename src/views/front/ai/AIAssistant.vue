<template>
  <div class="ai-assistant-page">
    <el-card class="chat-container">
      <template #header>
        <div class="chat-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI 智能导购助手</span>
          <div class="header-right">
            <el-button-group size="small">
              <el-button
                :type="chatMode === 'single' ? 'primary' : 'default'"
                @click="switchMode('single')"
              >
                单轮模式
              </el-button>
              <el-button
                :type="chatMode === 'multi' ? 'primary' : 'default'"
                @click="switchMode('multi')"
              >
                多轮模式
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 聊天消息区域 -->
      <div class="message-area" ref="messageAreaRef">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="welcome-tip">
          <el-empty description="您好！我是 AI 智能导购助手">
            <template #image>
              <el-icon :size="60" color="#409EFF"><ChatDotRound /></el-icon>
            </template>
          </el-empty>
          <div class="suggestion-box">
            <p>您可以问我：</p>
            <el-space wrap>
              <el-tag
                v-for="suggestion in suggestions"
                :key="suggestion"
                class="suggestion-tag"
                type="info"
                effect="plain"
                @click="useSuggestion(suggestion)"
              >
                {{ suggestion }}
              </el-tag>
            </el-space>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else class="message-list">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', msg.type]"
          >
            <!-- AI 消息 -->
            <template v-if="msg.type === 'ai'">
              <div class="message-avatar ai-avatar">
                <el-icon><Robot /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMarkdown(msg.text)"></div>
                <!-- 相关商品推荐 -->
                <div v-if="msg.products && msg.products.length > 0" class="related-products">
                  <div class="section-title">相关商品推荐</div>
                  <el-row :gutter="12">
                    <el-col
                      v-for="product in msg.products"
                      :key="product.spuId"
                      :xs="24"
                      :sm="12"
                      :md="8"
                    >
                      <el-card
                        class="product-card"
                        shadow="hover"
                        @click="goToProduct(product.spuId)"
                      >
                        <div class="product-info">
                          <el-image
                            :src="product.picture || 'https://via.placeholder.com/80'"
                            fit="cover"
                            class="product-image"
                          />
                          <div class="product-detail">
                            <div class="product-name">{{ product.name }}</div>
                            <div class="product-title">{{ product.title }}</div>
                            <div class="product-price">¥{{ product.listPrice }}</div>
                            <div class="product-meta">
                              <el-tag size="small" v-if="product.brandName">{{ product.brandName }}</el-tag>
                              <el-tag size="small" type="info" v-if="product.categoryName">{{ product.categoryName }}</el-tag>
                            </div>
                            <div class="product-tags" v-if="product.tags">
                              <el-tag size="small" type="warning" v-for="tag in product.tags.split(',')" :key="tag">
                                {{ tag }}
                              </el-tag>
                            </div>
                          </div>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </template>

            <!-- 用户消息 -->
            <template v-else>
              <div class="message-content user-content">
                <div class="message-text">{{ msg.text }}</div>
              </div>
              <div class="message-avatar user-avatar">
                <el-icon><User /></el-icon>
              </div>
            </template>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="message-item ai loading">
            <div class="message-avatar ai-avatar">
              <el-icon><Robot /></el-icon>
            </div>
            <div class="message-content">
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          placeholder="请输入您的问题，如：3000元左右适合学生用的手机推荐"
          resize="none"
          :disabled="loading"
          @keyup.enter.ctrl="sendQuestion"
        />
        <div class="input-actions">
          <el-switch
            v-model="includeProducts"
            active-text="显示相关商品"
            inactive-text=""
          />
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!question.trim()"
            @click="sendQuestion"
          >
            发送
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 商品对比功能 -->
    <el-card class="compare-container" v-if="selectedProducts.length > 0">
      <template #header>
        <div class="compare-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>商品对比 ({{ selectedProducts.length }}/4)</span>
          <el-button type="danger" size="small" @click="clearSelection">清空</el-button>
        </div>
      </template>
      <div class="compare-tips">
        <el-alert title="选择2-4个商品后可进行AI智能对比" type="info" :closable="false" />
      </div>
      <el-row :gutter="12" class="selected-products">
        <el-col
          v-for="product in selectedProducts"
          :key="product.spuId"
          :span="6"
        >
          <el-card shadow="hover" class="selected-card">
            <el-image
              :src="product.picture || 'https://via.placeholder.com/60'"
              fit="cover"
              class="selected-image"
            />
            <div class="selected-info">
              <div class="selected-name">{{ product.name }}</div>
              <div class="selected-price">¥{{ product.listPrice }}</div>
            </div>
            <el-button
              type="danger"
              size="small"
              circle
              class="remove-btn"
              @click="removeFromSelection(product.spuId)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </el-card>
        </el-col>
      </el-row>
      <el-button
        type="primary"
        size="large"
        class="compare-btn"
        :loading="comparing"
        :disabled="selectedProducts.length < 2 || comparing"
        @click="startCompare"
      >
        <el-icon><DataAnalysis /></el-icon>
        开始 AI 对比
      </el-button>
    </el-card>

    <!-- 对比结果弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="AI 商品对比结果"
      width="900px"
      destroy-on-close
    >
      <div v-if="compareResult" class="compare-result">
        <!-- 商品图片行 -->
        <div class="compare-images">
          <div
            v-for="product in compareResult.products"
            :key="product.id"
            class="compare-image-item"
          >
            <el-image
              :src="product.picture || 'https://via.placeholder.com/60'"
              fit="cover"
              class="compare-product-image"
            />
            <div class="compare-product-name">{{ product.name }}</div>
          </div>
        </div>

        <!-- 维度对比表格 -->
        <el-table :data="compareTableData" border size="small">
          <el-table-column prop="dimension" label="对比维度" width="120" fixed />
          <el-table-column
            v-for="(product, pIndex) in compareResult.products"
            :key="product.id"
            :label="product.name"
          >
            <template #default="{ row }">
              <div class="compare-cell">
                {{ row.values[pIndex] || '-' }}
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 综合推荐 -->
        <el-alert
          v-if="compareResult.summary"
          :title="compareResult.summary"
          type="success"
          :closable="false"
          class="compare-summary"
        />
      </div>
      <template #footer>
        <el-button @click="compareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { askAI, compareProducts, sendChatMessage } from '@/api/ai'

const router = useRouter()

// 聊天相关
const chatMode = ref('single') // 'single' 单轮, 'multi' 多轮
const sessionId = ref(null)
const question = ref('')
const messages = ref([])
const loading = ref(false)
const includeProducts = ref(true)
const messageAreaRef = ref(null)

// 建议问题
const suggestions = [
  '3000元左右适合学生用的手机推荐',
  '有哪些性价比高的无线耳机？',
  '2000元以内适合拍照的手机',
  '推荐几款适合游戏的笔记本电脑',
  '有什么适合送礼的电子产品？'
]

// 商品对比相关
const selectedProducts = ref([])
const comparing = ref(false)
const compareDialogVisible = ref(false)
const compareResult = ref(null)

// 转换对比数据为表格格式
const compareTableData = computed(() => {
  if (!compareResult.value?.dimensions) return []
  return compareResult.value.dimensions.map((dimension, index) => ({
    dimension,
    values: compareResult.value.products.map(p => p.dimensionValues?.[index] || '-')
  }))
})

// 切换对话模式
function switchMode(mode) {
  if (chatMode.value === mode) return
  chatMode.value = mode
  messages.value = []
  sessionId.value = null
  if (mode === 'multi') {
    ElMessage.info('已切换到多轮对话模式，支持连续对话')
  } else {
    ElMessage.info('已切换到单轮对话模式')
  }
}

// 使用建议问题
function useSuggestion(text) {
  question.value = text
  sendQuestion()
}

// 处理 AI 回复
function handleAIReply(res) {
  const data = res.data
  if (chatMode.value === 'multi' && data.sessionId) {
    sessionId.value = data.sessionId
  }
  messages.value.push({
    type: 'ai',
    text: data.reply || data.answer,
    products: data.relatedProducts || []
  })
}

// 发送问题
async function sendQuestion() {
  const q = question.value.trim()
  if (!q || loading.value) return

  // 添加用户消息
  messages.value.push({ type: 'user', text: q })
  question.value = ''
  loading.value = true
  scrollToBottom()

  try {
    let res
    if (chatMode.value === 'multi') {
      res = await sendChatMessage(sessionId.value, q)
    } else {
      res = await askAI(q, includeProducts.value ? 5 : 0)
    }
    handleAIReply(res)
  } catch (error) {
    messages.value.push({
      type: 'ai',
      text: '抱歉，AI服务暂时不可用，请稍后重试。',
      products: []
    })
  } finally {
    loading.value = false
    nextTick(scrollToBottom)
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messageAreaRef.value) {
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
  }
}

// 简单 Markdown 格式化
function formatMarkdown(text) {
  if (!text) return ''
  // 转义 HTML
  let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // 加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>')
  // 列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>')
  // 换行
  html = html.replace(/\n/g, '<br>')
  return html
}

// 跳转到商品详情
function goToProduct(spuId) {
  router.push(`/product/${spuId}`)
}

// 从选择中移除
function removeFromSelection(spuId) {
  const index = selectedProducts.value.findIndex(p => p.spuId === spuId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  }
}

// 清空选择
function clearSelection() {
  selectedProducts.value = []
  compareResult.value = null
}

// 开始对比
async function startCompare() {
  if (selectedProducts.value.length < 2) {
    ElMessage.warning('请至少选择2个商品进行对比')
    return
  }

  comparing.value = true
  try {
    const spuIds = selectedProducts.value.map(p => p.spuId)
    const res = await compareProducts(spuIds)
    compareResult.value = res.data
    compareDialogVisible.value = true
  } catch (error) {
    ElMessage.error('AI对比服务暂时不可用，请稍后重试')
  } finally {
    comparing.value = false
  }
}

// 添加到对比选择（从商品卡片）
function addToCompare(product) {
  if (selectedProducts.value.length >= 4) {
    ElMessage.warning('最多只能选择4个商品进行对比')
    return
  }
  if (selectedProducts.value.some(p => p.spuId === product.spuId)) {
    ElMessage.info('该商品已在选择列表中')
    return
  }
  selectedProducts.value.push(product)
  ElMessage.success(`已添加"${product.name}"到对比选择`)
}

// 暴露方法供外部调用
defineExpose({ addToCompare })
</script>

<style scoped>
.ai-assistant-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.chat-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.header-right {
  margin-left: auto;
}

.message-area {
  flex: 1;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.welcome-tip {
  text-align: center;
  padding: 40px 0;
}

.suggestion-box {
  margin-top: 20px;
}

.suggestion-box p {
  color: #909399;
  margin-bottom: 12px;
}

.suggestion-tag {
  cursor: pointer;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: #409EFF;
  color: white;
}

.user-avatar {
  background: #67C23A;
  color: white;
}

.message-content {
  max-width: 80%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  word-break: break-word;
  color: #303133;
}

.ai .message-text {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #303133;
}

.user-content .message-text {
  background: #409EFF;
  color: white;
}

.related-products {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 12px;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-info {
  display: flex;
  gap: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.product-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.product-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409EFF;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 商品对比 */
.compare-container {
  margin-top: 20px;
}

.compare-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compare-header span {
  flex: 1;
  font-weight: 600;
}

.compare-tips {
  margin-bottom: 16px;
}

.selected-products {
  margin-bottom: 16px;
}

.selected-card {
  position: relative;
  text-align: center;
}

.selected-image {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.selected-info {
  font-size: 12px;
}

.selected-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-price {
  color: #F56C6C;
  font-weight: 600;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.compare-btn {
  width: 100%;
}

/* 对比结果 */
.compare-images {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.compare-image-item {
  flex: 1;
  text-align: center;
}

.compare-product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin: 0 auto 8px;
}

.compare-product-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}

.compare-cell {
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
}

.compare-summary {
  margin-top: 16px;
}
</style>
