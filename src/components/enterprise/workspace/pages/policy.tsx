import { Link } from "@/components/router/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

type PolicyAudience = "产业岗位" | "院校教学" | "人才评价";

type PolicyItem = {
  date: string;
  year: string;
  category: string;
  title: string;
  issuer: string;
  summary: string;
  audiences: PolicyAudience[];
  href: string;
};

const policyPaths = [
  {
    title: "产业岗位",
    detail: "把智能建造与城市更新的一线任务带进培养过程。",
    href: "/platform/resources",
    icon: BriefcaseBusiness,
  },
  {
    title: "院校教学",
    detail: "把工程资源转化为可教、可练的课程与教材。",
    href: "/platform/courses",
    icon: GraduationCap,
  },
  {
    title: "人才评价",
    detail: "让能力测评、成果认证与就业服务形成闭环。",
    href: "/platform/assessment",
    icon: ShieldCheck,
  },
];

const policies: PolicyItem[] = [
  {
    date: "2019.02",
    year: "2019",
    category: "职教改革",
    title: "国家职业教育改革实施方案",
    issuer: "国务院",
    summary: "明确职业教育与普通教育是不同类型、同等重要的教育，系统部署产教融合、校企双元育人等改革任务。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/content/2019-02/13/content_5365341.htm",
  },
  {
    date: "2020.07",
    year: "2020",
    category: "智能建造",
    title: "关于推动智能建造与建筑工业化协同发展的指导意见",
    issuer: "住房和城乡建设部等 13 部门",
    summary: "提出到 2025 年基本建立智能建造政策体系和产业体系，推动 BIM、建筑机器人、建筑产业互联网与装配式建筑协同发展。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/zhengceku/2020-07/28/content_5530762.htm",
  },
  {
    date: "2021.10",
    year: "2021",
    category: "体系建设",
    title: "关于推动现代职业教育高质量发展的意见",
    issuer: "中共中央办公厅、国务院办公厅",
    summary: "提出到 2025 年基本建成现代职业教育体系，强化产教融合办学体制与校企合作机制。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/2021-10/12/content_5642120.htm",
  },
  {
    date: "2022.12",
    year: "2022",
    category: "体系建设",
    title: "关于深化现代职业教育体系建设改革的意见",
    issuer: "中共中央办公厅、国务院办公厅",
    summary: "以“一体、两翼、五重点”深化体系建设，把市域产教联合体、行业产教融合共同体作为关键载体。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/2022-12/21/content_5732986.htm",
  },
  {
    date: "2023.06",
    year: "2023",
    category: "产教融合",
    title: "职业教育产教融合赋能提升行动实施方案（2023—2025年）",
    issuer: "国家发展改革委等部门",
    summary: "推动产业需求更好融入人才培养全过程，提出建设产教融合试点城市和产教融合型企业等行动目标。",
    audiences: ["产业岗位", "院校教学"],
    href: "https://www.gov.cn/zhengce/zhengceku/202306/content_6886061.htm",
  },
  {
    date: "2025.01",
    year: "2025",
    category: "教育强国",
    title: "教育强国建设规划纲要（2024—2035年）",
    issuer: "中共中央、国务院",
    summary: "强化教育对科技和人才的支撑，推动教育链、人才链与产业链、创新链有效衔接。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/202501/content_6999913.htm",
  },
  {
    date: "2025.05",
    year: "2025",
    category: "城市更新",
    title: "关于持续推进城市更新行动的意见",
    issuer: "中共中央办公厅、国务院办公厅",
    summary: "提出到 2030 年城市更新体制机制不断完善，部署既有建筑改造、老旧小区整治、完整社区建设和历史文化保护等八项任务。",
    audiences: ["产业岗位", "院校教学", "人才评价"],
    href: "https://www.gov.cn/zhengce/202505/content_7023882.htm",
  },
  {
    date: "2026.02",
    year: "2026",
    category: "教学改革",
    title: "关于深化职业教育教学关键要素改革的意见",
    issuer: "教育部",
    summary: "聚焦专业、课程、教材、教师和实习实训，推动教学关键要素与产业升级、技术迭代同步更新。",
    audiences: ["院校教学", "人才评价"],
    href: "https://www.moe.gov.cn/srcsite/A07/zcs_zhgg/202602/t20260212_1428773.html",
  },
];

export function PolicyView() {
  return (
    <>
      <section className="ep-policy-hero ep-full-bleed" aria-labelledby="policy-page-title">
        <div className="ep-policy-hero-grid" aria-hidden="true" />
        <div className="ep-policy-hero-inner">
          <div className="ep-policy-hero-copy">
            <span className="ep-policy-kicker">NATIONAL POLICY · INDUSTRY-EDUCATION INTEGRATION</span>
            <h1 id="policy-page-title">国家政策</h1>
            <p>从职业教育改革、智能建造到城市有机更新，连接产业岗位、院校教学与人才评价的实践方向。</p>
          </div>
          <nav className="ep-policy-pathways" aria-label="国家政策与平台能力">
            {policyPaths.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <span><Icon size={17} strokeWidth={1.7} />{item.title}</span>
                  <p>{item.detail}</p>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="ep-policy-section ep-policy-timeline-section" aria-labelledby="policy-timeline-title">
        <div className="ep-policy-section-head">
          <div>
            <span>POLICY TIMELINE</span>
            <h2 id="policy-timeline-title">从体系构建到教学落地</h2>
          </div>
          <p>八项国家级政策，勾勒出职业教育、智能建造与城市更新的协同方向。</p>
        </div>
        <ol className="ep-policy-timeline">
          {policies.map((policy) => (
            <li key={`${policy.date}-${policy.title}`}>
              <div className="ep-policy-date">
                <time>{policy.year}</time>
                <span>{policy.date}</span>
                <i aria-hidden="true" />
              </div>
              <article>
                <div className="ep-policy-card-top">
                  <span>{policy.category}</span>
                  <small>{policy.issuer}</small>
                </div>
                <h3>{policy.title}</h3>
                <p>{policy.summary}</p>
                <div className="ep-policy-card-bottom">
                  <div className="ep-policy-audiences">
                    {policy.audiences.map((audience) => <span key={audience}>{audience}</span>)}
                  </div>
                  <a href={policy.href} target="_blank" rel="noreferrer">
                    查看原文
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <p className="ep-policy-note">政策摘要仅作学习参考，以官方原文为准。资料整理截至 2026 年 11 月。</p>
      </section>

      <section className="ep-policy-section ep-policy-support" aria-labelledby="policy-support-title">
        <div>
          <span>POLICY TO PRACTICE</span>
          <h2 id="policy-support-title">把政策方向落到每一段培养过程</h2>
          <p>场景化产教融合平台连接产业岗位、院校教学与人才评价，让岗位标准进入课堂，让学习成果形成能力证据。</p>
          <Link className="ep-policy-support-link" href="/platform/resources">
            进入岗位与场景
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className="ep-policy-support-unit">
          <span>平台体系支撑单位</span>
          杭州知与未来科技有限公司
        </p>
      </section>
    </>
  );
}
