import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BookOpen, BriefcaseBusiness, GraduationCap, Network, UsersRound } from "lucide-react";
import { IndustryHero } from "@/components/enterprise/industry-hero";
import {
  capabilities, companyMetrics, companyOverview, companySources, csnaPrograms,
  industryPractices, milestones, products, recognitions, strengths,
} from "@/components/enterprise/company-profile-data";

const companyPath = "/platform/industry/company";

const platformEntries = [
  { icon: Network, title: "岗位与场景", detail: "岗位能力与一线实训", href: "/platform/resources" },
  { icon: BookOpen, title: "课程与教材", detail: "数字课程与配套教材", href: "/platform/courses" },
  { icon: BadgeCheck, title: "测评与证书", detail: "能力评价与结业认证", href: "/platform/assessment" },
  { icon: BriefcaseBusiness, title: "产业项目实战", detail: "企业项目与成果交付", href: "/platform/projects" },
  { icon: UsersRound, title: "就业服务", detail: "招聘岗位与应聘服务", href: "/platform/employment" },
];

const detailSections = [
  { id: "company-strengths", label: "企业概况" },
  { id: "company-products", label: "核心产品" },
  { id: "company-practices", label: "行业实践" },
  { id: "company-history", label: "发展历程" },
  { id: "company-csna", label: "认证培训" },
  { id: "company-contact", label: "联系科来" },
];

function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="ep-company-text-link" href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function CompanyMetrics() {
  return (
    <div className="ep-company-metrics ep-full-bleed">
      <dl className="ep-company-metrics-inner" aria-label="科来网络概况">
        {companyMetrics.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PlatformEntries() {
  return (
    <section className="ep-company-section" aria-labelledby="company-entries-title">
      <div className="ep-company-section-lead"><h2 id="company-entries-title">产业人才培养</h2></div>
      <div className="ep-company-entry-grid">
        {platformEntries.map(({ icon: Icon, title, detail, href }) => (
          <Link href={href} key={href}>
            <span className="ep-company-feature-icon"><Icon size={23} strokeWidth={1.65} aria-hidden="true" /></span>
            <strong>{title}</strong>
            <span>{detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CompanyOverview({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="ep-company-section ep-company-strengths" id="company-strengths" aria-labelledby="company-strengths-title">
      <div className="ep-company-strength-visual">
        <Image
          src="/brand/colasoft-company-strength.webp"
          alt="蓝色网络数据流与可观测基础设施"
          fill
          sizes="(max-width: 800px) 100vw, 42vw"
        />
      </div>
      <div>
        <div className="ep-company-section-lead">
          <h2 id="company-strengths-title">{detailed ? "企业概况" : "认识科来网络"}</h2>
          {companyOverview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {detailed
            ? <OfficialLink href={companySources.about}>科来官网 · 企业介绍</OfficialLink>
            : <Link className="ep-company-text-link" href={companyPath}>查看企业详情</Link>}
        </div>
        <div className="ep-company-strength-grid">
          {strengths.map(({ icon: Icon, title, detail, url }) => (
            <article key={title}>
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{detail}{url && <> <OfficialLink href={url}>官网数据</OfficialLink></>}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanyCapabilities() {
  return (
    <section className="ep-company-section" aria-labelledby="company-capabilities-title">
      <div className="ep-company-section-lead">
        <h2 id="company-capabilities-title">从一条报文到一次故障复盘</h2>
        <p>科来的可观测产品以流量为数据基础，让性能指标、网络路径和故障证据落到同一次排查中。</p>
        <OfficialLink href={companySources.technology}>科来官网 · 技术能力</OfficialLink>
      </div>
      <ol className="ep-company-capability-grid">
        {capabilities.map(({ icon: Icon, title, detail }) => (
          <li key={title}>
            <span className="ep-company-feature-icon"><Icon size={22} strokeWidth={1.65} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProductPortfolio({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="ep-company-section" id="company-products" aria-labelledby="company-products-title">
      <div className="ep-company-section-lead ep-company-section-lead-actions">
        <div>
          <h2 id="company-products-title">核心产品体系</h2>
          <p>以 UPM 汇集运行指标与业务体验，以 RAS 保留原始报文。云网观测、告警治理、交易分析和小科 AI 可结合这两类数据参与诊断。</p>
          {detailed && <p>科来早期推出的 CSNAS 网络分析系统面向协议解析与故障诊断。产品此后延伸至工控安全、云资源池和智算中心，覆盖设备、网络、应用与业务链路。</p>}
        </div>
        {detailed
          ? <OfficialLink href={companySources.products}>科来官网 · 产品中心</OfficialLink>
          : <Link className="ep-company-text-link" href={`${companyPath}#company-products`}>查看完整产品体系</Link>}
      </div>
      <div className="ep-company-products-grid">
        {(detailed ? products : products.slice(0, 6)).map(({ icon: Icon, name, category, detail, url }) => (
          <article key={name}>
            <span className="ep-company-feature-icon"><Icon size={20} strokeWidth={1.65} aria-hidden="true" /></span>
            <div>
              <p className="ep-company-product-category">{category}</p>
              <h3>{name}</h3>
              <p>{detail}</p>
              {detailed && <OfficialLink href={url}>查看官网资料<span className="ep-company-sr-only"> · {name}</span></OfficialLink>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IndustryPractices({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="ep-company-section" id="company-practices" aria-labelledby="company-practices-title">
      <div className="ep-company-section-lead ep-company-section-lead-actions">
        <div>
          <h2 id="company-practices-title">关键行业的运行现场</h2>
          <p>根据科来公开案例与解决方案整理，覆盖交易连续性、生产调度和云资源池服务质量。</p>
        </div>
        {detailed
          ? <OfficialLink href={companySources.cases}>科来官网 · 客户案例</OfficialLink>
          : <Link className="ep-company-text-link" href={`${companyPath}#company-practices`}>查看更多行业实践</Link>}
      </div>
      <div className="ep-company-practice-grid">
        {(detailed ? industryPractices : industryPractices.slice(0, 3)).map(({ industry, title, image, alt, detail, url }) => (
          <article key={industry}>
            <div className="ep-company-practice-image">
              <Image src={image} alt={alt} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" />
              <span>{industry}</span>
            </div>
            <div className="ep-company-practice-copy">
              <h3>{title}</h3>
              <p>{detail}</p>
              <OfficialLink href={url}>查看官网资料<span className="ep-company-sr-only"> · {industry}</span></OfficialLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyHistory() {
  return (
    <section className="ep-company-section ep-company-story" id="company-history" aria-labelledby="company-history-title">
      <div className="ep-company-section-lead">
        <h2 id="company-history-title">发展历程</h2>
        <p>从独立的网络分析工具，到面向大型数据中心、混合云和智算集群的可观测性产品。</p>
        <OfficialLink href={companySources.about}>科来官网 · 企业介绍</OfficialLink>
      </div>
      <ol className="ep-company-timeline">
        {milestones.map(({ phase, title, detail }) => (
          <li key={phase}><time>{phase}</time><h3>{title}</h3><p>{detail}</p></li>
        ))}
      </ol>
    </section>
  );
}

function Recognitions() {
  return (
    <section className="ep-company-section" id="company-recognition" aria-labelledby="company-recognition-title">
      <div className="ep-company-section-lead"><h2 id="company-recognition-title">行业认可</h2></div>
      <div className="ep-company-recognition-grid">
        {recognitions.map(({ icon: Icon, title, detail, url }) => (
          <article key={title}>
            <span className="ep-company-feature-icon"><Icon size={20} strokeWidth={1.65} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{detail}</p>
            <OfficialLink href={url}>查看官网资料<span className="ep-company-sr-only"> · {title}</span></OfficialLink>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyTraining() {
  return (
    <section className="ep-company-section" id="company-csna" aria-labelledby="company-csna-title">
      <div className="ep-company-section-lead ep-company-section-lead-actions">
        <div>
          <h2 id="company-csna-title">CSNA 认证与技术培训</h2>
          <p>科来于 2005 年开办 CSNA 网络分析认证培训，把协议分析、业务性能排查和安全事件研判中的实际经验用于技术教学。公开资料介绍了以下三个认证方向。</p>
        </div>
        <OfficialLink href={companySources.protocolMap}>下载《网络通讯协议图》2023 版</OfficialLink>
      </div>
      <div className="ep-company-csna-grid">
        {csnaPrograms.map(({ code, name, detail }) => (
          <article key={code}>
            <GraduationCap size={22} strokeWidth={1.7} aria-hidden="true" />
            <strong>{code}</strong>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <div className="ep-company-training-note">
        <p>本平台将网络部署、需求理解、链路分析、故障定位、安全研判和交付汇报融入场景实训。学生可以通过课程掌握基础知识，再使用任务成果验证岗位能力。</p>
        <Link className="ep-company-text-link" href="/platform/courses">查看平台课程</Link>
      </div>
    </section>
  );
}

function CompanySections({ detailed = false, industrySection }: { detailed?: boolean; industrySection?: ReactNode }) {
  return (
    <>
      <CompanyOverview detailed={detailed} />
      <CompanyCapabilities />
      <ProductPortfolio detailed={detailed} />
      <IndustryPractices detailed={detailed} />
      {industrySection && (
        <section className="ep-company-section ep-company-industry" id="industry-analysis" aria-label="行业应用与专业群">
          {industrySection}
        </section>
      )}
      <CompanyHistory />
      <Recognitions />
      <CompanyTraining />
    </>
  );
}

export function CompanyProfile({ industrySection }: { industrySection?: ReactNode }) {
  return (
    <div className="ep-company-page">
      <IndustryHero />
      <CompanyMetrics />
      <PlatformEntries />
      <CompanySections industrySection={industrySection} />
    </div>
  );
}

function CompanyContact() {
  return (
    <section className="ep-company-section ep-company-contact" id="company-contact" aria-labelledby="company-contact-title">
      <div className="ep-company-section-lead">
        <h2 id="company-contact-title">联系科来</h2>
        <p>产品咨询、运行支持与培训信息可通过科来官网及客户服务渠道获取。</p>
        <OfficialLink href={companySources.offices}>查看分支机构地址</OfficialLink>
      </div>
      <dl>
        <div><dt>企业名称</dt><dd>科来网络技术股份有限公司</dd></div>
        <div><dt>成都总部</dt><dd>成都市高新区天府大道北段 966 号 4 号楼 12–14 层</dd></div>
        <div><dt>客户服务</dt><dd><a href="tel:4006869069">400-6869-069</a></dd></div>
        <div><dt>服务邮箱</dt><dd><a href="mailto:support@colasoft.com.cn">support@colasoft.com.cn</a></dd></div>
      </dl>
    </section>
  );
}

export function CompanyDetail() {
  return (
    <div className="ep-company-page">
      <section className="ep-company-detail-hero ep-full-bleed" aria-labelledby="company-detail-title">
        <div>
          <Link href="/platform/industry">返回平台首页</Link>
          <h1 id="company-detail-title">关于科来网络</h1>
          <p>科来专注于网络流量采集与分析，为企业的网络、业务应用与 AI 基础设施提供可观测性产品与技术服务。</p>
        </div>
      </section>
      <nav className="ep-company-detail-nav ep-full-bleed" aria-label="企业详情导航">
        <div>
          {detailSections.map(({ id, label }) => <a href={`#${id}`} key={id}>{label}</a>)}
        </div>
      </nav>
      <CompanyMetrics />
      <CompanySections detailed />
      <CompanyContact />
    </div>
  );
}
