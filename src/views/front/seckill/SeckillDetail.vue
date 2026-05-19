<template>
  <div class="seckill-detail-page" v-loading="loading">
    <el-card v-if="product">
      <!-- 秒杀状态提示 -->
      <el-alert
        v-if="seckillStatus === 'not_started'"
        title="秒杀尚未开始"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          距离开始还有：<span class="countdown-highlight">{{ getCountdown(product.startTime) }}</span>
        </template>
      </el-alert>
      
      <el-alert
        v-else-if="seckillStatus === 'ongoing'"
        title="秒杀进行中"
        type="success"
        :closable="false"
        show-icon
      >
        <template #default>
          距离结束还有：<span class="countdown-highlight">{{ getCountdown(product.endTime) }}</span>
        </template>
      </el-alert>
      
      <el-alert
        v-else
        title="秒杀已结束"
        type="warning"
        :closable="false"
        show-icon
      />

      <!-- 商品信息区 -->
      <div class="product-main">
        <!-- 左侧图片 -->
        <div class="product-gallery">
          <div class="main-image">
            <el-image
              :src="currentImage"
              fit="contain"
              style="width: 100%; height: 400px"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="thumbnail-list">
            <div
              v-for="(img, index) in imageList"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <el-image :src="img" fit="cover" style="width: 100%; height: 100%" />
            </div>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>
          <p class="product-subtitle">{{ product.description }}</p>

          <div class="price-section">
            <div class="price-row">
              <span class="label">秒杀价：</span>
              <span class="seckill-price">¥{{ product.seckillListPrice }}</span>
            </div>
            <div class="original-price-row">
              <span class="label">原价：</span>
              <span class="original-price">¥{{ product.listPrice }}</span>
              <el-tag size="small" type="danger">
                {{ getDiscount(product.listPrice, product.seckillListPrice) }}折
              </el-tag>
            </div>
          </div>

          <div class="info-item">
            <span class="label">品牌：</span>
            <span>{{ product.brandName }}</span>
          </div>

          <div class="info-item">
            <span class="label">分类：</span>
            <span>{{ product.categoryName }}</span>
          </div>

          <div class="info-item">
            <span class="label">库存：</span>
            <span>{{ product.stock }} {{ product.unit }}</span>
          </div>

          <div class="info-item">
            <span class="label">时间：</span>
            <span>{{ product.startTime }} 至 {{ product.endTime }}</span>
          </div>

          <!-- 秒杀按钮 -->
          <div class="action-buttons">
            <el-button
              v-if="seckillStatus === 'ongoing' && product.url"
              type="danger"
              size="large"
              class="btn-flash-big"
              @click="showOrderDialog = true"
            >
              <el-icon><Lightning /></el-icon>
              立即秒杀
            </el-button>
            <el-button
              v-else
              disabled
              size="large"
              class="btn-disabled-big"
            >
              <el-icon><Clock /></el-icon>
              {{ seckillStatus === 'not_started' ? '等待开始' : '已结束' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- SKU选择 -->
      <div v-if="skuList.length > 0" class="sku-section">
        <h3>选择规格</h3>
        <div class="sku-list">
          <div
            v-for="sku in skuList"
            :key="sku.id"
            class="sku-item"
            :class="{ selected: selectedSku?.id === sku.id, 'sold-out': sku.stock === 0 }"
            @click="sku.stock > 0 && selectSku(sku)"
          >
            <div class="sku-info">
              <p class="sku-title">{{ sku.title }}</p>
              <p class="sku-price">
                <span class="seckill-price">¥{{ sku.seckillPrice }}</span>
                <span class="original-price">¥{{ sku.price }}</span>
              </p>
              <p class="sku-stock">
                <template v-if="sku.stock > 0">库存：{{ sku.stock }} | 限购：{{ sku.seckillLimit }}件</template>
                <span v-else class="sold-out-text">已售罄</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="detail-section">
        <h3>商品详情</h3>
        <div class="detail-content" v-html="pageDetail"></div>
      </div>
    </el-card>

    <!-- 提交订单对话框 -->
    <el-dialog
      v-model="showOrderDialog"
      title="确认秒杀订单"
      width="600px"
    >
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="orderRules"
        label-width="100px"
      >
        <!-- 收货人信息 -->
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="orderForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="mobilePhone">
          <el-input v-model="orderForm.mobilePhone" placeholder="请输入11位手机号" />
        </el-form-item>

        <el-form-item label="固定电话" prop="telephone">
          <el-input v-model="orderForm.telephone" placeholder="选填" />
        </el-form-item>

        <!-- 地址信息 - 省市区级联选择 -->
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="街道" prop="streetName">
              <el-input v-model="orderForm.streetName" placeholder="如：中关村街道" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" prop="detailedAddress">
              <el-input v-model="orderForm.detailedAddress" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址标签">
          <el-radio-group v-model="orderForm.tag">
            <el-radio value="家">家</el-radio>
            <el-radio value="公司">公司</el-radio>
            <el-radio value="学校">学校</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 支付信息 -->
        <el-form-item label="支付方式" prop="paymentType">
          <el-radio-group v-model="orderForm.paymentType">
            <el-radio :value="0">银联</el-radio>
            <el-radio :value="1">微信</el-radio>
            <el-radio :value="2">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 订单金额 -->
        <el-form-item label="购买数量" prop="quantity">
          <el-input-number
            v-model="orderForm.quantity"
            :min="1"
            :max="selectedSku?.seckillLimit || 1"
          />
        </el-form-item>

        <el-form-item label="商品总价">
          <span class="price-highlight">
            ¥{{ (selectedSku?.seckillPrice * orderForm.quantity).toFixed(2) }}
          </span>
        </el-form-item>

        <el-form-item label="运费">
          <span>¥{{ orderForm.amountOfFreight.toFixed(2) }}</span>
        </el-form-item>

        <el-form-item label="优惠金额">
          <span class="discount">-¥{{ orderForm.amountOfDiscount.toFixed(2) }}</span>
        </el-form-item>

        <el-form-item label="实付金额">
          <span class="total-price">
            ¥{{ calculateActualPay().toFixed(2) }}
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showOrderDialog = false">取消</el-button>
        <el-button type="danger" @click="submitOrder" :loading="submitting">
          确认秒杀
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture, Lightning, Clock } from '@element-plus/icons-vue'
import {
  getSeckillSpuDetail,
  getSeckillSpuPageDetail,
  getSeckillSkuList,
  submitSeckillOrder
} from '@/api/seckill'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const product = ref(null)
const pageDetail = ref('')
const skuList = ref([])
const selectedSku = ref(null)
const currentImage = ref('')
const showOrderDialog = ref(false)
const seckillStatus = ref('not_started')

// 倒计时定时器
let timer = null

// 订单表单
const orderFormRef = ref(null)
const orderForm = ref({
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
  tag: '家',
  paymentType: 1,
  amountOfOriginalPrice: 0,
  amountOfFreight: 0,
  amountOfDiscount: 0,
  amountOfActualPay: 0,
  quantity: 1
})

// 省市区级联选择
const selectedRegion = ref([])

// 省市区数据（包含代码）
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
    const province = regionOptions.value.find(p => p.code === value[0])
    const city = province?.children?.find(c => c.code === value[1])
    const district = city?.children?.find(d => d.code === value[2])

    if (province && city && district) {
      orderForm.value.provinceCode = province.code
      orderForm.value.provinceName = province.name
      orderForm.value.cityCode = city.code
      orderForm.value.cityName = city.name
      orderForm.value.districtCode = district.code
      orderForm.value.districtName = district.name
    }
  }
}

// 表单验证规则
const orderRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  mobilePhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
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

// 图片列表
const imageList = computed(() => {
  if (!product.value?.pictures) return []
  try {
    return JSON.parse(product.value.pictures)
  } catch {
    return []
  }
})

// 获取商品详情
const fetchProductDetail = async () => {
  const spuId = route.params.id
  loading.value = true
  
  try {
    // 获取基本信息
    const detailRes = await getSeckillSpuDetail(spuId)
    product.value = detailRes.data
    
    // 设置默认图片
    if (imageList.value.length > 0) {
      currentImage.value = imageList.value[0]
    }

    // 更新秒杀状态
    updateSeckillStatus()

    // 获取详情页
    const pageRes = await getSeckillSpuPageDetail(spuId)
    pageDetail.value = pageRes.data.detail || ''

    // 获取SKU列表
    const skuRes = await getSeckillSkuList(spuId)
    skuList.value = skuRes.data || []
    
    // 默认选中第一个有库存的SKU
    if (skuList.value.length > 0) {
      const available = skuList.value.find(s => s.stock > 0)
      selectedSku.value = available || skuList.value[0]
      initOrderForm()
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 更新秒杀状态
const updateSeckillStatus = () => {
  if (!product.value) return
  
  const now = new Date().getTime()
  const startTime = new Date(product.value.startTime).getTime()
  const endTime = new Date(product.value.endTime).getTime()
  
  if (now < startTime) {
    seckillStatus.value = 'not_started'
  } else if (now >= startTime && now <= endTime) {
    seckillStatus.value = 'ongoing'
  } else {
    seckillStatus.value = 'ended'
  }
}

// 初始化订单表单
const initOrderForm = () => {
  if (!selectedSku.value) return
  
  orderForm.value.amountOfOriginalPrice = selectedSku.value.price * orderForm.value.quantity
  orderForm.value.amountOfFreight = 0
  orderForm.value.amountOfDiscount = (selectedSku.value.price - selectedSku.value.seckillPrice) * orderForm.value.quantity
}

// 计算实付金额
const calculateActualPay = () => {
  return orderForm.value.amountOfOriginalPrice + 
         orderForm.value.amountOfFreight - 
         orderForm.value.amountOfDiscount
}

// 选择SKU
const selectSku = (sku) => {
  selectedSku.value = sku
  initOrderForm()
}

// 计算倒计时
const getCountdown = (targetTime) => {
  const now = new Date().getTime()
  const target = new Date(targetTime).getTime()
  const diff = target - now
  
  if (diff <= 0) {
    return '00:00:00'
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 计算折扣
const getDiscount = (originalPrice, seckillPrice) => {
  if (!originalPrice || !seckillPrice) return 0
  const discount = (seckillPrice / originalPrice) * 10
  return discount.toFixed(1)
}

// 提交订单
const submitOrder = async () => {
  if (!orderFormRef.value) return
  
  await orderFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (!selectedSku.value) {
      ElMessage.warning('请选择商品规格')
      return
    }

    if (selectedSku.value.stock === 0) {
      ElMessage.warning('该规格已售罄')
      return
    }

    if (!product.value?.url) {
      ElMessage.error('秒杀链接无效，请确认秒杀活动正在进行')
      return
    }

    submitting.value = true
    
    try {
      // 构造订单数据（JSON嵌套格式，与API文档一致）
      const orderData = {
        spuId: product.value.id,
        contactName: orderForm.value.contactName,
        mobilePhone: orderForm.value.mobilePhone,
        telephone: orderForm.value.telephone || null,
        provinceCode: orderForm.value.provinceCode,
        provinceName: orderForm.value.provinceName,
        cityCode: orderForm.value.cityCode,
        cityName: orderForm.value.cityName,
        districtCode: orderForm.value.districtCode,
        districtName: orderForm.value.districtName,
        streetCode: orderForm.value.streetCode || null,
        streetName: orderForm.value.streetName,
        detailedAddress: orderForm.value.detailedAddress,
        tag: orderForm.value.tag,
        paymentType: orderForm.value.paymentType,
        amountOfOriginalPrice: orderForm.value.amountOfOriginalPrice,
        amountOfFreight: orderForm.value.amountOfFreight,
        amountOfDiscount: orderForm.value.amountOfDiscount,
        amountOfActualPay: calculateActualPay(),
        seckillOrderItemAddDTO: {
          skuId: selectedSku.value.id,
          title: selectedSku.value.title,
          mainPicture: imageList.value[0] || '',
          price: selectedSku.value.seckillPrice,
          quantity: orderForm.value.quantity,
          barCode: selectedSku.value.barCode || '',
          data: selectedSku.value.data || '{}'
        }
      }

      // 提取随机码
      const randCode = product.value.url.replace('/seckill/', '')
      
      const res = await submitSeckillOrder(randCode, orderData)
      
      ElMessage.success('秒杀成功！订单号：' + res.data.sn)
      showOrderDialog.value = false
      
      // 跳转到订单列表
      setTimeout(() => {
        router.push('/order')
      }, 1500)
    } catch (error) {
      // 秒杀特有错误处理
      const msg = error.response?.data?.message || error.message || ''
      if (error.response?.status === 403 || msg.includes('已经购买过')) {
        ElMessage.error('您已经购买过该商品，秒杀商品限购1件')
      } else if (error.response?.status === 400 || msg.includes('售罄')) {
        ElMessage.error('抱歉，该商品已售罄')
      } else if (error.response?.status === 404 || msg.includes('随机码')) {
        ElMessage.error('秒杀链接已失效，请刷新页面重试')
      } else if (error.response?.status === 500 || msg.includes('服务器忙')) {
        ElMessage.warning('当前访问人数过多，请稍后再试')
      } else {
        ElMessage.error(msg || '秒杀失败，请重试')
      }
      console.error(error)
    } finally {
      submitting.value = false
    }
  })
}

// 启动倒计时更新
const startCountdown = () => {
  timer = setInterval(() => {
    updateSeckillStatus()
    // 强制更新视图
    if (product.value) {
      product.value = { ...product.value }
    }
  }, 1000)
}

onMounted(() => {
  fetchProductDetail()
  startCountdown()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.seckill-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.countdown-highlight {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.product-main {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.product-gallery {
  flex: 0 0 450px;
}

.main-image {
  width: 100%;
  height: 400px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 50px;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: #f56c6c;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.product-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 20px 0;
}

.price-section {
  padding: 20px 0;
  border-top: 2px solid #f56c6c;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.price-row,
.original-price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.seckill-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 600;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.label {
  display: inline-block;
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.action-buttons {
  margin-top: 30px;
}

.action-buttons .el-button {
  height: 52px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  letter-spacing: 2px;
  transition: all 0.25s ease;
  padding: 0 40px;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
}

.action-buttons .el-button:active {
  transform: translateY(0);
}

/* 立即秒杀按钮 */
.btn-flash-big {
  background: linear-gradient(135deg, #f56c6c, #e63946);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.35);
}
.btn-flash-big:hover {
  background: linear-gradient(135deg, #e74c5e, #d32f3f);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 24px rgba(245, 108, 108, 0.5);
}

/* 禁用按钮 */
.btn-disabled-big {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.sku-section {
  margin: 40px 0;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.sku-section h3 {
  margin-bottom: 20px;
}

.sku-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.sku-item {
  padding: 15px;
  border: 2px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.sku-item:hover {
  border-color: #f56c6c;
}

.sku-item.selected {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.sku-item.sold-out {
  opacity: 0.5;
  cursor: not-allowed;
}

.sold-out-text {
  color: #f56c6c;
  font-weight: 600;
}

.sku-title {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.sku-price {
  margin: 0 0 5px 0;
}

.sku-stock {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.detail-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.detail-section h3 {
  margin-bottom: 20px;
}

.detail-content {
  line-height: 1.8;
}

.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.price-highlight {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

.discount {
  color: #67c23a;
}

.total-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}

@media (max-width: 767px) {
  .product-main {
    flex-direction: column;
    gap: 20px;
    margin-top: 12px;
    margin-bottom: 20px;
  }

  .product-gallery {
    flex: none;
    width: 100%;
  }

  .main-image {
    height: 280px;
  }

  .product-title {
    font-size: 18px;
  }

  .price-section .seckill-price {
    font-size: 26px;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .sku-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
