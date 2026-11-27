import {
  Award, BadgeCheck, Bot, Boxes, Building2, Cpu, DraftingCompass, Factory,
  Globe2, Leaf, Network, RefreshCw, ShieldCheck, Sparkles,
} from "lucide-react";

const official = "https://ccsic.cscec.com";
const steel = "https://sstr.cscec.com";
const green = "https://www.cscecgreentech.com";

export const companySources = {
  about: `${official}/zjgg/gywm31/gsjj31/202206/3546808.html`,
  history: `${official}/gywm31/fzlc31/201305/2711984.html`,
  products: `${official}`,
  cases: `${official}/zjgg/xwzx31/`,
  cityRenewal: "https://m.dutenews.com/n/article/60075370",
  smartConstruction: "https://zjgg.cscec.com/xwzx/ggyw/202506/3879818.html",
  cTower: "https://www.cscec.com.cn/xwzx_new/zqydt_new/202409/3817595.html",
  kangjianRoad: "https://www.cscec.com/zgjz_new/xwzx_new/zqydt_new/202601/3926555.html",
  gsBuilding: `${green}/about-us`,
  steelStructure: `${steel}/gywm/gsjj/`,
};

export const companyMetrics = [
  { value: "120万吨", label: "钢结构年产能" },
  { value: "15幢", label: "全球 400 米以上高楼参建" },
  { value: "400+", label: "GS 体系落地项目" },
  { value: "40+", label: "业务覆盖国家和地区" },
];

export const companyOverview = [
  "中建科工集团有限公司（简称中建科工）是中国建筑集团旗下核心子企业，总部位于深圳，前身为 2008 年组建的中建钢构有限公司，2019 年更名为中建科工。公司以钢结构为核心能力，形成产品、工程、运营三大业务与孵化业务协同的“3+X”业务组合，实行“中建科工 + 中建钢构”双品牌运营。",
  "面向智能建造与城市有机更新，中建科工构建了 GS-Building 钢结构装配式建筑体系与 ME-House 模块化建筑体系，研发“灵犀魔方”产线智能化解决方案和建筑机器人产品，并将钢结构、检测加固、数字孪生与运营能力组合应用于超高层、大跨度场馆、模块化建筑和既有城区更新。",
];

export const strengths = [
  {
    icon: Building2,
    title: "钢结构主业",
    detail: "钢结构年产能超 120 万吨，全球最高 10 幢大楼中参建 4 幢，全球 38 幢 400 米以上大楼中承建 15 幢。",
    url: companySources.steelStructure,
  },
  {
    icon: Boxes,
    title: "建筑工业化",
    detail: "GS-Building 体系已落地 400 多个项目、建筑面积超 4000 万平方米；ME-House 模块化产品实现工厂集成与快速交付。",
    url: companySources.gsBuilding,
  },
  {
    icon: Cpu,
    title: "智能建造",
    detail: "建成 8 个制造基地、40 余条智能生产线，自主研发切割、焊接、除锈、喷涂、物流、巡检等机器人产品。",
    url: companySources.smartConstruction,
  },
  {
    icon: RefreshCw,
    title: "城市有机更新",
    detail: "以“投建运”一体化参与老旧小区、历史街区、公共场馆和工业建筑更新，代表项目包括深圳百姓书房、宝安 1990、深圳体育中心。",
    url: companySources.cityRenewal,
  },
];

export const capabilities = [
  {
    icon: DraftingCompass,
    title: "数字设计",
    detail: "以 BIM 深化设计、构件拆分和数字孪生模型连接设计意图、工厂制造与现场安装，提前解决碰撞和接口问题。",
  },
  {
    icon: Factory,
    title: "工厂制造",
    detail: "通过智能生产线、模块化箱体集成和“灵犀魔方”产线智能体，把现场作业前移到工厂，稳定质量与节拍。",
  },
  {
    icon: Bot,
    title: "现场建造",
    detail: "以吊装、测量校正、焊接机器人和智慧工地平台组织现场施工，让进度、质量与安全状态可测、可追溯。",
  },
  {
    icon: RefreshCw,
    title: "更新运营",
    detail: "从城市体检、检测鉴定、加固改造到运营导入，以全生命周期视角推动存量空间的功能更新与价值提升。",
  },
];

export const products = [
  {
    icon: Building2,
    name: "GS-Building 钢结构装配式建筑",
    category: "建筑工业化",
    detail: "以钢结构为主框架，围护、设备管线与内装系统工厂预制、现场装配，覆盖学校、医院、住宅、办公、产业园和酒店等产品系列。",
    url: companySources.gsBuilding,
  },
  {
    icon: Boxes,
    name: "ME-House 模块化建筑",
    category: "模块化建筑",
    detail: "以钢构件组成箱体单元，在工厂完成结构、围护、内装与机电集成，应用于学校、医院、公寓、酒店和城市更新场景。",
    url: `${green}/about-us`,
  },
  {
    icon: Sparkles,
    name: "灵犀魔方",
    category: "智能制造",
    detail: "面向钢结构产线的智能化解决方案，以“1 个产线大脑 + 2 个终端小脑 + 4 大核心能力”实现产线设计、仿真、控制与调度。",
    url: companySources.smartConstruction,
  },
  {
    icon: Bot,
    name: "建筑机器人",
    category: "智能装备",
    detail: "覆盖切割、焊接、除锈、喷涂、物流和巡检等工序，结合 3D 视觉与自动路径规划，提升效率并稳定质量。",
    url: companySources.smartConstruction,
  },
  {
    icon: RefreshCw,
    name: "城市更新投建运",
    category: "城市更新",
    detail: "围绕老旧小区、历史街区、公共空间和工业建筑，提供体检策划、投资建设、改造施工与运营衔接的一体化服务。",
    url: companySources.cityRenewal,
  },
  {
    icon: ShieldCheck,
    name: "检测鉴定与加固改造",
    category: "既有建筑",
    detail: "面向既有建筑开展结构检测、安全鉴定、加固设计与不停业改造，支撑医院、学校和老旧住宅的功能提升。",
    url: companySources.kangjianRoad,
  },
  {
    icon: Network,
    name: "智慧工地与数字孪生",
    category: "数字建造",
    detail: "接入塔吊、环境、劳务、视频与进度数据，以统一编码构建项目数字孪生，为现场决策和运维交付提供依据。",
    url: companySources.products,
  },
  {
    icon: Leaf,
    name: "绿色建筑与建筑能源",
    category: "绿色低碳",
    detail: "结合装配式建造、光储直柔与建筑能耗管理，降低建造和运行阶段的资源消耗与碳排放。",
    url: companySources.products,
  },
];

export const industryPractices = [
  {
    industry: "超高层",
    title: "深圳湾超级总部基地 C 塔",
    image: "/resources/covers/zjkg/highrise.svg",
    alt: "超高层钢结构与智慧建造",
    detail: "400 米级双子塔项目启用钢结构智慧建造中心，以可移动“智慧胶囊工厂”集成柔性焊接机器人，探索高空钢结构的工厂化建造方式。",
    url: companySources.cTower,
  },
  {
    industry: "大跨度场馆",
    title: "深圳体育中心改造",
    image: "/resources/covers/zjkg/venue.svg",
    alt: "大跨度场馆屋盖",
    detail: "作为第十五届全运会重要场馆，改造在保留城市记忆的同时提升结构安全、赛事功能与公共开放体验。",
    url: companySources.cityRenewal,
  },
  {
    industry: "城市更新",
    title: "百姓书房与宝安 1990",
    image: "/resources/covers/zjkg/renewal.svg",
    alt: "历史街区与公共文化空间更新",
    detail: "把 1990 年代老建筑转化为 24 小时公共阅读空间和文化场馆，以钢结构加建、BIM 与模块化建造缩短工期并保留城市记忆。",
    url: companySources.cityRenewal,
  },
  {
    industry: "模块化建筑",
    title: "湾区会展国际酒店与模块化学校",
    image: "/resources/covers/zjkg/modular.svg",
    alt: "模块化箱体建筑",
    detail: "以 ME-House 体系完成永久性模块化酒店、学校和公寓，工厂集成结构、机电与内装，现场以吊装和接口连接快速交付。",
    url: companySources.gsBuilding,
  },
  {
    industry: "智能工厂",
    title: "惠州模块化制造基地",
    image: "/resources/covers/zjkg/factory.svg",
    alt: "智能工厂与焊接产线",
    detail: "以智能生产线和“灵犀魔方”产线智能体组织构件生产，通过节拍管理、机器人协同和质量追溯稳定工厂交付。",
    url: companySources.smartConstruction,
  },
  {
    industry: "既有建筑",
    title: "上海康健路原拆原建",
    image: "/resources/covers/zjkg/retrofit.svg",
    alt: "既有住宅检测与改造",
    detail: "上海首个原拆原建钢结构住宅样板工程，以钢结构装配式体系在有限场地内完成拆除重建，探索老旧住宅更新的技术与管理路径。",
    url: companySources.kangjianRoad,
  },
];

export const milestones = [
  {
    phase: "1985—2007",
    title: "超高层施工能力起步",
    detail: "从深圳发展中心到深圳地王大厦，中建三局钢结构团队在超高层钢结构施工中积累测量、吊装与焊接能力。",
  },
  {
    phase: "2008",
    title: "中建钢构成立",
    detail: "以中建三局钢结构公司为主体，整合中建系统优质钢结构资源，组建中建钢构有限公司。",
  },
  {
    phase: "2013",
    title: "全产业链与“钢结构+”",
    detail: "升级为中建股份二级子企业，推进设计、制造、安装、检测一体化，拓展装配式建筑与模块化产品。",
  },
  {
    phase: "2019—2020",
    title: "更名中建科工",
    detail: "中建钢构更名为中建科工集团有限公司，形成“中建科工 + 中建钢构”双品牌，聚焦建筑工业化、数字化与绿色化。",
  },
  {
    phase: "2022",
    title: "绿色科技与模块化提速",
    detail: "中建科工绿色科技公司成立，ME-House 模块化建筑体系在酒店、学校、公寓和海外项目落地。",
  },
  {
    phase: "2024—2025",
    title: "智能建造产品化",
    detail: "钢结构智慧建造中心在深圳湾 C 塔启用；“灵犀魔方”产线智能化解决方案发布，建筑机器人形成系列产品。",
  },
  {
    phase: "2025—2026",
    title: "城市更新投建运一体化",
    detail: "城市更新成为战略性新兴业务，形成体检策划、投资建设、改造施工与运营衔接的一体化能力。",
  },
];

export const recognitions = [
  {
    icon: Award,
    title: "钢结构行业竞争力榜首",
    detail: "公开资料显示，中建科工位居中国钢结构行业竞争力榜首，是国家级高新技术企业。",
    url: companySources.about,
  },
  {
    icon: BadgeCheck,
    title: "国家知识产权示范企业",
    detail: "拥有国家知识产权示范企业、国家高新技术企业等资质，持续投入钢结构、装配式与智能建造技术研发。",
    url: companySources.about,
  },
  {
    icon: Factory,
    title: "国家级绿色工厂",
    detail: "广东、四川、武汉等钢结构制造基地获评国家级绿色工厂，推动制造环节节能降碳。",
    url: companySources.steelStructure,
  },
  {
    icon: Globe2,
    title: "全球工程实践",
    detail: "业务覆盖 40 多个国家和地区，参与埃及标志塔等海外超高层项目，输出中国钢结构建造标准。",
    url: companySources.about,
  },
];

export const trainingPrograms = [
  {
    code: "SC-01",
    name: "智能建造岗位认证",
    detail: "面向智慧工地、建筑机器人与数字孪生岗位，覆盖设备接入、数据治理、现场协同与交付验收。",
  },
  {
    code: "SC-02",
    name: "钢结构深化设计认证",
    detail: "面向深化设计、节点构造与构件清单岗位，训练 BIM 建模、碰撞检查和工厂现场交底能力。",
  },
  {
    code: "SC-03",
    name: "城市更新与加固认证",
    detail: "面向城市体检、更新策划与既有建筑加固岗位，训练检测鉴定、方案测算和不停业施工组织能力。",
  },
];
