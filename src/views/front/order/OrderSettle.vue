<template>
  <div class="order-settle-page" v-loading="loading">
    <el-card class="settle-container">
      <template #header>
        <h3>确认订单</h3>
      </template>

      <!-- 收货地址 -->
      <div class="address-section">
        <h4>收货地址</h4>
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="联系人" prop="contactName">
                <el-input v-model="addressForm.contactName" placeholder="请输入联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号" prop="mobilePhone">
                <el-input v-model="addressForm.mobilePhone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="固定电话" prop="telephone">
                <el-input v-model="addressForm.telephone" placeholder="可选" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="省市区" prop="region">
                <el-cascader
                  v-model="selectedRegion"
                  :options="regionOptions"
                  :props="{ value: 'code', label: 'name', children: 'children' }"
                  placeholder="请选择省市区"
                  style="width: 100%"
                  @change="handleRegionChange"
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="街道" prop="streetName">
                <el-input v-model="addressForm.streetName" placeholder="如：中关村街道" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="详细地址" prop="detailedAddress">
            <el-input v-model="addressForm.detailedAddress" type="textarea" :rows="2" placeholder="请输入详细地址" />
          </el-form-item>

          <el-form-item label="标签">
            <el-radio-group v-model="addressForm.tag">
              <el-radio value="家">家</el-radio>
              <el-radio value="公司">公司</el-radio>
              <el-radio value="学校">学校</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品清单 -->
      <div class="goods-section">
        <h4>商品清单</h4>
        <div class="goods-list">
          <div v-for="item in orderItems" :key="item.skuId" class="goods-item">
            <el-image 
              :src="item.mainPicture || 'https://via.placeholder.com/80'" 
              fit="cover"
              class="goods-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="goods-info">
              <div class="goods-title">{{ item.title }}</div>
              <div class="goods-specs" v-if="item.data">{{ parseSpecs(item.data) }}</div>
              <div class="goods-price-qty">
                <span class="price">¥{{ item.price }}</span>
                <span class="qty">x{{ item.quantity }}</span>
              </div>
            </div>
            <div class="goods-subtotal">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <h4>支付方式</h4>
        <el-radio-group v-model="paymentType">
          <el-radio :value="1">微信支付</el-radio>
          <el-radio :value="2">支付宝</el-radio>
          <el-radio :value="0">银联</el-radio>
        </el-radio-group>
      </div>

      <!-- 金额明细 -->
      <div class="amount-section">
        <div class="amount-row">
          <span>商品总额</span>
          <span>¥{{ totalPrice }}</span>
        </div>
        <div class="amount-row">
          <span>运费</span>
          <span>¥{{ freight.toFixed(2) }}</span>
        </div>
        <div class="amount-row">
          <span>优惠</span>
          <span>-¥{{ discount.toFixed(2) }}</span>
        </div>
        <el-divider />
        <div class="amount-row total">
          <span>实付金额</span>
          <span class="price">¥{{ actualPay }}</span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button size="large" @click="$router.back()">返回</el-button>
        <el-button 
          type="primary" 
          size="large" 
          :loading="submitting"
          @click="handleSubmitOrder"
        >
          提交订单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/store/cart'
import { createOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const submitting = ref(false)
const addressFormRef = ref(null)

// 收货地址表单
const addressForm = ref({
  contactName: '',
  mobilePhone: '',
  telephone: '',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  streetCode: '',
  streetName: '',
  detailedAddress: '',
  tag: '家'
})

// 省市区数据（包含代码）
const selectedRegion = ref([])
const regionOptions = ref([
  {
    code: '110000',
    name: '北京市',
    children: [
      {
        code: '110100',
        name: '北京市',
        children: [
          { code: '110101', name: '东城区' }, { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' }, { code: '110106', name: '丰台区' },
          { code: '110107', name: '石景山区' }, { code: '110108', name: '海淀区' },
          { code: '110109', name: '门头沟区' }, { code: '110111', name: '房山区' },
          { code: '110112', name: '通州区' }, { code: '110113', name: '顺义区' },
          { code: '110114', name: '昌平区' }, { code: '110115', name: '大兴区' },
          { code: '110116', name: '怀柔区' }, { code: '110117', name: '平谷区' },
          { code: '110118', name: '密云区' }, { code: '110119', name: '延庆区' }
        ]
      }
    ]
  },
  {
    code: '310000',
    name: '上海市',
    children: [
      {
        code: '310100',
        name: '上海市',
        children: [
          { code: '310101', name: '黄浦区' }, { code: '310104', name: '徐汇区' },
          { code: '310105', name: '长宁区' }, { code: '310106', name: '静安区' },
          { code: '310107', name: '普陀区' }, { code: '310109', name: '虹口区' },
          { code: '310110', name: '杨浦区' }, { code: '310112', name: '闵行区' },
          { code: '310113', name: '宝山区' }, { code: '310114', name: '嘉定区' },
          { code: '310115', name: '浦东新区' }, { code: '310116', name: '金山区' },
          { code: '310117', name: '松江区' }, { code: '310118', name: '青浦区' },
          { code: '310120', name: '奉贤区' }, { code: '310151', name: '崇明区' }
        ]
      }
    ]
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      {
        code: '440100',
        name: '广州市',
        children: [
          { code: '440103', name: '荔湾区' }, { code: '440104', name: '越秀区' },
          { code: '440105', name: '海珠区' }, { code: '440106', name: '天河区' },
          { code: '440111', name: '白云区' }, { code: '440112', name: '黄埔区' },
          { code: '440113', name: '番禺区' }, { code: '440114', name: '花都区' },
          { code: '440115', name: '南沙区' }, { code: '440117', name: '从化区' },
          { code: '440118', name: '增城区' }
        ]
      },
      {
        code: '440300',
        name: '深圳市',
        children: [
          { code: '440303', name: '罗湖区' }, { code: '440304', name: '福田区' },
          { code: '440305', name: '南山区' }, { code: '440306', name: '宝安区' },
          { code: '440307', name: '龙岗区' }, { code: '440308', name: '盐田区' },
          { code: '440309', name: '龙华区' }, { code: '440310', name: '坪山区' },
          { code: '440311', name: '光明区' }
        ]
      },
      {
        code: '440600',
        name: '佛山市',
        children: [
          { code: '440604', name: '禅城区' }, { code: '440605', name: '南海区' },
          { code: '440606', name: '顺德区' }, { code: '440607', name: '三水区' },
          { code: '440608', name: '高明区' }
        ]
      },
      {
        code: '441900',
        name: '东莞市',
        children: [
          { code: '441900', name: '东莞市' }
        ]
      }
    ]
  },
  {
    code: '330000',
    name: '浙江省',
    children: [
      {
        code: '330100',
        name: '杭州市',
        children: [
          { code: '330102', name: '上城区' }, { code: '330103', name: '下城区' },
          { code: '330104', name: '江干区' }, { code: '330105', name: '拱墅区' },
          { code: '330106', name: '西湖区' }, { code: '330108', name: '滨江区' },
          { code: '330109', name: '萧山区' }, { code: '330110', name: '余杭区' },
          { code: '330111', name: '富阳区' }, { code: '330112', name: '临安区' },
          { code: '330122', name: '桐庐县' }, { code: '330127', name: '淳安县' },
          { code: '330182', name: '建德市' }
        ]
      },
      {
        code: '330200',
        name: '宁波市',
        children: [
          { code: '330203', name: '海曙区' }, { code: '330205', name: '江北区' },
          { code: '330206', name: '北仑区' }, { code: '330211', name: '镇海区' },
          { code: '330212', name: '鄞州区' }, { code: '330213', name: '奉化区' },
          { code: '330225', name: '象山县' }, { code: '330226', name: '宁海县' },
          { code: '330281', name: '余姚市' }, { code: '330282', name: '慈溪市' }
        ]
      },
      {
        code: '330300',
        name: '温州市',
        children: [
          { code: '330302', name: '鹿城区' }, { code: '330303', name: '龙湾区' },
          { code: '330304', name: '瓯海区' }, { code: '330305', name: '洞头区' },
          { code: '330324', name: '永嘉县' }, { code: '330326', name: '平阳县' },
          { code: '330327', name: '苍南县' }, { code: '330328', name: '文成县' },
          { code: '330329', name: '泰顺县' }, { code: '330381', name: '瑞安市' },
          { code: '330382', name: '乐清市' }, { code: '330383', name: '龙港市' }
        ]
      }
    ]
  },
  {
    code: '320000',
    name: '江苏省',
    children: [
      {
        code: '320100',
        name: '南京市',
        children: [
          { code: '320102', name: '玄武区' }, { code: '320104', name: '秦淮区' },
          { code: '320105', name: '建邺区' }, { code: '320106', name: '鼓楼区' },
          { code: '320111', name: '浦口区' }, { code: '320113', name: '栖霞区' },
          { code: '320114', name: '雨花台区' }, { code: '320115', name: '江宁区' },
          { code: '320116', name: '六合区' }, { code: '320117', name: '溧水区' },
          { code: '320118', name: '高淳区' }
        ]
      },
      {
        code: '320500',
        name: '苏州市',
        children: [
          { code: '320505', name: '虎丘区' }, { code: '320506', name: '吴中区' },
          { code: '320507', name: '相城区' }, { code: '320508', name: '姑苏区' },
          { code: '320509', name: '吴江区' }, { code: '320581', name: '常熟市' },
          { code: '320582', name: '张家港市' }, { code: '320583', name: '昆山市' },
          { code: '320585', name: '太仓市' }
        ]
      },
      {
        code: '320200',
        name: '无锡市',
        children: [
          { code: '320205', name: '锡山区' }, { code: '320206', name: '惠山区' },
          { code: '320211', name: '滨湖区' }, { code: '320213', name: '梁溪区' },
          { code: '320214', name: '新吴区' }, { code: '320281', name: '江阴市' },
          { code: '320282', name: '宜兴市' }
        ]
      }
    ]
  },
  {
    code: '510000',
    name: '四川省',
    children: [
      {
        code: '510100',
        name: '成都市',
        children: [
          { code: '510104', name: '锦江区' }, { code: '510105', name: '青羊区' },
          { code: '510106', name: '金牛区' }, { code: '510107', name: '武侯区' },
          { code: '510108', name: '成华区' }, { code: '510112', name: '龙泉驿区' },
          { code: '510113', name: '青白江区' }, { code: '510114', name: '新都区' },
          { code: '510115', name: '温江区' }, { code: '510116', name: '双流区' },
          { code: '510117', name: '郫都区' }, { code: '510118', name: '新津区' },
          { code: '510121', name: '金堂县' }, { code: '510129', name: '大邑县' },
          { code: '510131', name: '蒲江县' }, { code: '510181', name: '都江堰市' },
          { code: '510182', name: '彭州市' }, { code: '510183', name: '邛崃市' },
          { code: '510184', name: '崇州市' }, { code: '510185', name: '简阳市' }
        ]
      }
    ]
  },
  {
    code: '420000',
    name: '湖北省',
    children: [
      {
        code: '420100',
        name: '武汉市',
        children: [
          { code: '420102', name: '江岸区' }, { code: '420103', name: '江汉区' },
          { code: '420104', name: '硚口区' }, { code: '420105', name: '汉阳区' },
          { code: '420106', name: '武昌区' }, { code: '420107', name: '青山区' },
          { code: '420111', name: '洪山区' }, { code: '420112', name: '东西湖区' },
          { code: '420113', name: '汉南区' }, { code: '420114', name: '蔡甸区' },
          { code: '420115', name: '江夏区' }, { code: '420116', name: '黄陂区' },
          { code: '420117', name: '新洲区' }
        ]
      }
    ]
  },
  {
    code: '430000',
    name: '湖南省',
    children: [
      {
        code: '430100',
        name: '长沙市',
        children: [
          { code: '430102', name: '芙蓉区' }, { code: '430103', name: '天心区' },
          { code: '430104', name: '岳麓区' }, { code: '430105', name: '开福区' },
          { code: '430111', name: '雨花区' }, { code: '430112', name: '望城区' },
          { code: '430121', name: '长沙县' }, { code: '430181', name: '浏阳市' },
          { code: '430182', name: '宁乡市' }
        ]
      }
    ]
  },
  {
    code: '610000',
    name: '陕西省',
    children: [
      {
        code: '610100',
        name: '西安市',
        children: [
          { code: '610102', name: '新城区' }, { code: '610103', name: '碑林区' },
          { code: '610104', name: '莲湖区' }, { code: '610111', name: '灞桥区' },
          { code: '610112', name: '未央区' }, { code: '610113', name: '雁塔区' },
          { code: '610114', name: '阎良区' }, { code: '610115', name: '临潼区' },
          { code: '610116', name: '长安区' }, { code: '610117', name: '高陵区' },
          { code: '610118', name: '鄠邑区' }, { code: '610122', name: '蓝田县' },
          { code: '610124', name: '周至县' }
        ]
      }
    ]
  },
  {
    code: '500000',
    name: '重庆市',
    children: [
      {
        code: '500100',
        name: '重庆市',
        children: [
          { code: '500101', name: '万州区' }, { code: '500102', name: '涪陵区' },
          { code: '500103', name: '渝中区' }, { code: '500104', name: '大渡口区' },
          { code: '500105', name: '江北区' }, { code: '500106', name: '沙坪坝区' },
          { code: '500107', name: '九龙坡区' }, { code: '500108', name: '南岸区' },
          { code: '500109', name: '北碚区' }, { code: '500110', name: '綦江区' },
          { code: '500111', name: '大足区' }, { code: '500112', name: '渝北区' },
          { code: '500113', name: '巴南区' }, { code: '500114', name: '黔江区' },
          { code: '500115', name: '长寿区' }, { code: '500116', name: '江津区' },
          { code: '500117', name: '合川区' }, { code: '500118', name: '永川区' },
          { code: '500119', name: '南川区' }, { code: '500120', name: '璧山区' },
          { code: '500151', name: '铜梁区' }, { code: '500152', name: '潼南区' },
          { code: '500153', name: '荣昌区' }, { code: '500154', name: '开州区' },
          { code: '500155', name: '梁平区' }, { code: '500156', name: '武隆区' }
        ]
      }
    ]
  },
  {
    code: '120000',
    name: '天津市',
    children: [
      {
        code: '120100',
        name: '天津市',
        children: [
          { code: '120101', name: '和平区' }, { code: '120102', name: '河东区' },
          { code: '120103', name: '河西区' }, { code: '120104', name: '南开区' },
          { code: '120105', name: '河北区' }, { code: '120106', name: '红桥区' },
          { code: '120110', name: '东丽区' }, { code: '120111', name: '西青区' },
          { code: '120112', name: '津南区' }, { code: '120113', name: '北辰区' },
          { code: '120114', name: '武清区' }, { code: '120115', name: '宝坻区' },
          { code: '120116', name: '滨海新区' }, { code: '120117', name: '宁河区' },
          { code: '120118', name: '静海区' }, { code: '120119', name: '蓟州区' }
        ]
      }
    ]
  }
])

// 处理省市区选择变化
const handleRegionChange = (value) => {
  if (value && value.length === 3) {
    // 查找选中的完整节点数据
    const province = regionOptions.value.find(p => p.code === value[0])
    const city = province?.children?.find(c => c.code === value[1])
    const district = city?.children?.find(d => d.code === value[2])

    if (province && city && district) {
      addressForm.value.provinceCode = province.code
      addressForm.value.provinceName = province.name
      addressForm.value.cityCode = city.code
      addressForm.value.cityName = city.name
      addressForm.value.districtCode = district.code
      addressForm.value.districtName = district.name
    }
  }
}

// 表单验证规则
const addressRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  mobilePhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [
    { 
      required: true, 
      validator: (rule, value, callback) => {
        if (!selectedRegion.value || selectedRegion.value.length !== 3) {
          callback(new Error('请选择省市区'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  streetName: [{ required: true, message: '请输入街道', trigger: 'blur' }],
  detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 订单商品列表
const orderItems = ref([])

// 支付方式
const paymentType = ref(1)

// 运费和优惠
const freight = ref(0)
const discount = ref(0)

// 解析规格JSON
const parseSpecs = (dataStr) => {
  try {
    const specs = JSON.parse(dataStr)
    return specs.map(s => `${s.name}:${s.value}`).join(', ')
  } catch {
    return dataStr
  }
}

// 商品总价
const totalPrice = computed(() => {
  return orderItems.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

// 实付金额
const actualPay = computed(() => {
  return (parseFloat(totalPrice.value) + freight.value - discount.value).toFixed(2)
})

// 提交订单
const handleSubmitOrder = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      if (orderItems.value.length === 0) {
        ElMessage.warning('请选择商品')
        return
      }

      submitting.value = true
      try {
        const orderData = {
          ...addressForm.value,
          paymentType: paymentType.value,
          amountOfOriginalPrice: parseFloat(totalPrice.value),
          amountOfFreight: freight.value,
          amountOfDiscount: discount.value,
          amountOfActualPay: parseFloat(actualPay.value),
          orderItems: orderItems.value.map(item => ({
            skuId: item.skuId,
            title: item.title,
            barCode: item.barCode || '',
            data: item.data || '[]',
            mainPicture: item.mainPicture,
            price: item.price,
            quantity: item.quantity
          }))
        }

        const res = await createOrder(orderData)
        
        ElMessage.success('订单提交成功')
        
        // 跳转到订单详情或支付页面
        setTimeout(() => {
          router.replace({
            path: '/order/detail',
            query: { id: res.data.id }
          })
        }, 1500)
      } catch (error) {
        console.error('下单失败:', error)
        ElMessage.error(error.message || '下单失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 加载数据
onMounted(async () => {
  loading.value = true
  try {
    // 从购物车获取选中商品
    const cartIds = route.query.cartIds?.split(',') || []
    
    if (cartIds.length > 0) {
      // 获取购物车列表并筛选选中的商品
      await cartStore.fetchCartList()
      orderItems.value = cartStore.cartItems.filter(
        item => cartIds.includes(String(item.id))
      )
      
      if (orderItems.value.length === 0) {
        ElMessage.warning('未找到选中的商品')
        router.back()
        return
      }
    } else {
      ElMessage.warning('请选择要结算的商品')
      router.back()
      return
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-settle-page {
  max-width: 1200px;
  margin: 0 auto;
}

.settle-container {
  margin-bottom: 20px;
}

.settle-container h3 {
  margin: 0;
  font-size: 20px;
}

.address-section,
.goods-section,
.payment-section,
.amount-section {
  margin-bottom: 30px;
}

.address-section h4,
.goods-section h4,
.payment-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.goods-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.goods-info {
  flex: 1;
}

.goods-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-specs {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.goods-price-qty {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.goods-price-qty .price {
  color: #f56c6c;
  font-weight: 600;
}

.goods-price-qty .qty {
  color: #909399;
}

.goods-subtotal {
  width: 120px;
  text-align: right;
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
}

.payment-section {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount-section {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-row.total {
  font-size: 18px;
  font-weight: 600;
}

.amount-row.total .price {
  font-size: 24px;
  color: #f56c6c;
}

.submit-section {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 767px) {
  .goods-item {
    flex-wrap: wrap;
    gap: 8px;
  }

  .goods-subtotal {
    width: 100%;
    text-align: left;
    padding-left: 95px;
  }

  .submit-section {
    flex-direction: column;
  }

  .submit-section .el-button {
    width: 100%;
  }
}
</style>
