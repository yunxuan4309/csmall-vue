<template>
  <div class="floating-ai">
    <!-- 悬浮按钮 -->
    <transition name="el-zoom-in-bottom">
      <div
        v-if="!isExpanded"
        class="floating-btn"
        @click="openPanel"
        title="AI 智能导购"
      >
        <el-badge v-if="compareCount > 0" :value="compareCount" :max="9">
          <el-icon :size="24"><ChatDotRound /></el-icon>
        </el-badge>
        <el-icon v-else :size="24"><ChatDotRound /></el-icon>
      </div>
    </transition>

    <!-- 展开面板 -->
    <transition name="el-fade-in-linear">
      <div v-if="isExpanded" class="floating-panel" :style="panelStyle">
        <!-- 拖拽手柄（左上角） -->
        <div class="resize-handle" @mousedown="onResizeStart" title="拖拽调整大小"></div>
        <!-- 头部 -->
        <div class="panel-header">
          <div class="header-title">
            <el-icon><Service /></el-icon>
            <span>AI 智能导购</span>
          </div>
          <div class="header-actions">
            <el-button
              v-if="messages.length > 0"
              type="info"
              size="small"
              @click="clearChat"
            >
              <el-icon><Plus /></el-icon>
              新对话
            </el-button>
            <el-button
              v-if="compareCount > 0"
              type="warning"
              size="small"
              :loading="comparing"
              @click="showCompare"
            >
              对比 ({{ compareCount }})
            </el-button>
            <el-button
              type="danger"
              size="small"
              circle
              @click="closePanel"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="panel-body" ref="messageAreaRef">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-tip">
            <el-icon :size="40" color="#409EFF"><ChatDotRound /></el-icon>
            <p>您好！我是 AI 智能导购助手</p>
            <div class="quick-questions">
              <el-tag
                v-for="q in quickQuestions"
                :key="q"
                size="small"
                type="info"
                effect="plain"
                class="question-tag"
                @click="askQuestion(q)"
              >
                {{ q }}
              </el-tag>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="message-list">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-item', msg.type]"
            >
              <template v-if="msg.type === 'ai'">
                <div class="message-text" v-html="formatMarkdown(msg.text)"></div>
                <div v-if="msg.products?.length" class="mini-products">
                  <div
                    v-for="product in msg.products.slice(0, 3)"
                    :key="product.spuId"
                    class="mini-product-item"
                    @click="goToProduct(product.spuId)"
                  >
                    <el-image
                      :src="product.picture || 'https://via.placeholder.com/40'"
                      fit="cover"
                      class="mini-product-img"
                    />
                    <div class="mini-product-info">
                      <div class="mini-product-name">{{ product.name }}</div>
                      <div class="mini-product-price">¥{{ product.listPrice }}</div>
                    </div>
                    <el-button
                      size="small"
                      type="primary"
                      @click.stop="addToCompare(product)"
                    >
                      对比
                    </el-button>
                  </div>
                  <el-button
                    v-if="msg.products.length > 3"
                    size="small"
                    link
                    @click="goToAIPage"
                  >
                    查看更多...
                  </el-button>
                </div>
              </template>
              <div v-else class="message-text user-text">{{ msg.text }}</div>
            </div>

            <!-- 加载中 -->
            <div v-if="loading" class="message-item ai">
              <div class="message-text loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 思考过程 -->
        <transition name="el-fade-in-linear">
          <div v-if="thinkingSteps.length > 0" class="thinking-bar">
            <div class="thinking-title">
              <el-icon><Loading /></el-icon> 正在为您搜索...
            </div>
            <div v-for="(step, i) in thinkingSteps" :key="i" class="thinking-step">
              {{ step }}
            </div>
          </div>
        </transition>

        <!-- 输入区域 -->
        <div class="panel-footer">
          <el-input
            v-model="question"
            size="small"
            placeholder="输入问题，Ctrl+Enter 发送"
            :disabled="loading"
            @keyup.enter.ctrl="sendQuestion"
            @keyup.enter.exact="sendQuestion"
          />
          <el-button
            type="primary"
            size="small"
            :loading="loading"
            :disabled="!question.trim()"
            @click="sendQuestion"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 对比结果弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="商品对比"
      width="800px"
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
              :src="product.picture || 'https://via.placeholder.com/50'"
              fit="cover"
              class="compare-img"
            />
            <div class="compare-name">{{ product.name }}</div>
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
          type="success"
          :closable="false"
        >
          <span v-html="formatMarkdown(compareResult.summary)" />
        </el-alert>
      </div>
      <template #footer>
        <el-button type="primary" @click="compareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Service, Close, Promotion, Plus, Loading } from '@element-plus/icons-vue'
import { compareProducts, streamChatMessage } from '@/api/ai'

const router = useRouter()

// 状态
const isExpanded = ref(false)
const sessionId = ref(null)
const question = ref('')
const messages = ref([])
const loading = ref(false)
const thinkingSteps = ref([])
const messageAreaRef = ref(null)

// 面板尺寸（可拖拽调整）
const panelWidth = ref(380)
const panelHeight = ref(500)
const MIN_W = 320
const MAX_W = 600
const MIN_H = 400
const MAX_H = 700
const panelStyle = computed(() => ({
  width: panelWidth.value + 'px',
  height: panelHeight.value + 'px'
}))

function onResizeStart(e) {
  const startX = e.clientX
  const startY = e.clientY
  const startW = panelWidth.value
  const startH = panelHeight.value
  function onMove(ev) {
    panelWidth.value = Math.min(MAX_W, Math.max(MIN_W, startW - (ev.clientX - startX)))
    panelHeight.value = Math.min(MAX_H, Math.max(MIN_H, startH - (ev.clientY - startY)))
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  e.preventDefault()
}

// 快捷问题
const quickQuestions = [
  '3000元手机推荐',
  '性价比耳机',
  '游戏笔记本'
]

// 对比相关
const compareCount = ref(0)
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

// 注册到全局
onMounted(() => {
  window.floatingAI = {
    addToCompare,
    selectedProducts,
    compareCount,
    openPanel
  }
})

onUnmounted(() => {
  delete window.floatingAI
})

// 打开面板
function openPanel() {
  isExpanded.value = true
}

// 关闭面板
function closePanel() {
  isExpanded.value = false
}

// 清空聊天记录，开始新对话
function clearChat() {
  messages.value = []
  sessionId.value = null
  ElMessage.success('已开启新对话')
}

// 跳转到 AI 完整页面
function goToAIPage() {
  closePanel()
  router.push('/ai')
}

// 快捷提问
function askQuestion(q) {
  question.value = q
  sendQuestion()
}

// 发送问题（流式）
async function sendQuestion() {
  const q = question.value.trim()
  if (!q || loading.value) return

  messages.value.push({ type: 'user', text: q })
  messages.value.push({ type: 'ai', text: '', products: [] })
  const aiMsgIndex = messages.value.length - 1
  question.value = ''
  loading.value = true
  scrollToBottom()

  let pendingProducts = null

  streamChatMessage(sessionId.value, q, {
    onThinking(step) {
      thinkingSteps.value.push(step)
      nextTick(scrollToBottom)
    },
    onSessionId(sid) {
      sessionId.value = sid
    },
    onProducts(products) {
      pendingProducts = products
    },
    async onChunk(chunk) {
      messages.value[aiMsgIndex].text += chunk
      await new Promise(r => setTimeout(r, 20))
      nextTick(scrollToBottom)
    },
    onDone() {
      loading.value = false
      thinkingSteps.value = []
      if (pendingProducts) {
        messages.value[aiMsgIndex].products = pendingProducts
      }
      if (!messages.value[aiMsgIndex].text) {
        messages.value[aiMsgIndex].text = '好的，已了解。'
      }
      nextTick(scrollToBottom)
    },
    onError(err) {
      loading.value = false
      thinkingSteps.value = []
      if (!messages.value[aiMsgIndex].text) {
        messages.value[aiMsgIndex].text = '抱歉，AI服务暂时不可用，请稍后重试。'
      }
    }
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
    }
  })
}

// Markdown 简化版
function formatMarkdown(text) {
  if (!text) return ''
  let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // **粗体**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // 清掉残余的 ** 和 *
  html = html.replace(/\*\*/g, '')
  html = html.replace(/\*/g, '')
  html = html.replace(/\n/g, '<br>')
  return html
}

// 跳转到商品详情
function goToProduct(spuId) {
  router.push(`/product/${spuId}`)
}

// 添加到对比
function addToCompare(product) {
  if (selectedProducts.value.length >= 4) {
    ElMessage.warning('最多4个商品')
    return
  }
  if (!selectedProducts.value.some(p => p.spuId === product.spuId)) {
    selectedProducts.value.push(product)
    compareCount.value = selectedProducts.value.length
    ElMessage.success(`已添加到对比（${compareCount.value}/4）`)
  }
}

// 显示对比结果
async function showCompare() {
  if (selectedProducts.value.length < 2) {
    ElMessage.warning('请先添加至少2个商品到对比')
    return
  }
  comparing.value = true
  try {
    const res = await compareProducts(selectedProducts.value.map(p => p.spuId))
    compareResult.value = res.data
    compareDialogVisible.value = true
  } catch (error) {
    ElMessage.error('AI对比服务暂时不可用')
  } finally {
    comparing.value = false
  }
}
</script>

<style scoped>
.floating-ai {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
}

.floating-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

.floating-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  cursor: nw-resize;
  z-index: 20;
  background: linear-gradient(135deg,
    transparent 40%, rgba(255,255,255,0.35) 40%,
    rgba(255,255,255,0.35) 55%, transparent 55%,
    transparent 70%, rgba(255,255,255,0.35) 70%,
    rgba(255,255,255,0.35) 85%, transparent 85%);
  border-radius: 12px 0 0 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.resize-handle:hover {
  opacity: 1;
  background: linear-gradient(135deg,
    transparent 40%, rgba(255,255,255,0.6) 40%,
    rgba(255,255,255,0.6) 55%, transparent 55%,
    transparent 70%, rgba(255,255,255,0.6) 70%,
    rgba(255,255,255,0.6) 85%, transparent 85%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f5f7fa;
}

.welcome-tip {
  text-align: center;
  padding: 30px 0;
}

.welcome-tip p {
  margin: 12px 0;
  color: #606266;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.question-tag {
  cursor: pointer;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.message-item.user {
  align-items: flex-end;
}

.message-text {
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.5;
  font-size: 14px;
  word-break: break-word;
  color: #303133;
}

.ai .message-text {
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  color: #303133;
}

.user-text {
  background: #409EFF;
  color: white;
}

.loading {
  display: flex;
  gap: 4px;
  padding: 12px 14px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409EFF;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.mini-products {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-product-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.mini-product-item:hover {
  background: #ecf5ff;
}

.mini-product-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.mini-product-info {
  flex: 1;
  min-width: 0;
  color: #303133;
}

.mini-product-name {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
}

.mini-product-price {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 600;
}

.panel-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #ebeef5;
}

/* 对比结果 */
.compare-images {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 8px;
}

.compare-image-item {
  flex: 1;
  text-align: center;
}

.compare-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin: 0 auto 4px;
}

.compare-name {
  font-size: 11px;
  font-weight: 600;
  color: #303133;
}

.compare-cell {
  font-size: 12px;
  line-height: 1.4;
  color: #303133;
}

.el-badge {
  position: static;
}

/* 思考过程 */
.thinking-bar {
  padding: 8px 12px;
  background: #f0f9ff;
  border-top: 1px solid #b3d8ff;
  font-size: 12px;
  max-height: 120px;
  overflow-y: auto;
}
.thinking-title {
  color: #409EFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.thinking-step {
  color: #606266;
  padding: 2px 0;
  font-family: monospace;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 手机端全屏面板 */
@media (max-width: 767px) {
  .floating-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100vw !important;
    height: 80vh !important;
    border-radius: 12px 12px 0 0;
  }

  .resize-handle {
    display: none;
  }

  .floating-btn {
    width: 48px;
    height: 48px;
  }

  .panel-body {
    font-size: 14px;
  }
}
</style>
