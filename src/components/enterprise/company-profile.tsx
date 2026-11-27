import type { ReactNode } from "react";
import { Image } from "@/components/router/image";
import { Link } from "@/components/router/link";
import { BadgeCheck, BookOpen, BriefcaseBusiness, DraftingCompass, GraduationCap, UsersRound } from "lucide-react";
import { IndustryHero } from "@/components/enterprise/industry-hero";
import {
  capabilities, companyMetrics, companyOverview, companySources, trainingPrograms,
  industryPractices, milestones, products, recognitions, strengths,
} from "@/components/enterprise/company-profile-data";

const companyPath = "/platform/industry/company";

const platformEntries = [
  { icon: DraftingCompass, title: "岗位与场景", detail: "岗位能力与一线实训", href: "/platform/resources" },
  { icon: BookOpen, title: "课程与教材", detail: "数字课程与配套教材", href: "/platform/courses" },
  { icon: BadgeCheck, title: "测评与证书", detail: "能力评价与结业认证", href: "/platform/assessment" },
  { icon: BriefcaseBusiness, title: "产业项目实战", detail: "企业项目与成果交付", href: "/platform/projects" },
  { icon: UsersRound, title: "就业服务", detail: "招聘岗位与应聘服务", href: "/platform/employment" },
];

const detailSections = [
  { id: "company-strengths", label: "企业概况" },
  { id: "company-products", label: "业务与产品" },
  { id: "company-practices", label: "工程实践" },
  { id: "company-history", label: "发展历程" },
  { id: "company-csna", label: "产业培训" },
  { id: "company-contact", label: "联系中建科工" },
];

function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="ep-company-text-link" href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function CompanyMetrics() {
  return (
    <div className="ep-company-metrics ep-full-bleed">
      <dl className="ep-company-metrics-inner" aria-label="中建科工概况">
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
          src="/brand/zjkg-company.svg"
          alt="钢结构节点与模块化建筑"
          fill
          sizes="(max-width: 800px) 100vw, 42vw"
        />
      </div>
      <div>
        <div className="ep-company-section-lead">
          <h2 id="company-strengths-title">{detailed ? "企业概况" : "认识中建科工"}</h2>
          {companyOverview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {detailed
            ? <OfficialLink href={companySources.about}>中建科工官网 · 企业介绍</OfficialLink>
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
        <h2 id="company-capabilities-title">从一张图纸到一次竣工交付</h2>
        <p>中建科工以数字模型为线索，把设计、工厂制造、现场建造和更新运营连接为同一条可追溯的工程链路。</p>
        <OfficialLink href={companySources.products}>中建科工官网 · 业务与产品</OfficialLink>
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
          <h2 id="company-products-title">业务与产品体系</h2>
          <p>以钢结构与装配式建筑为底座，把数字设计、智能工厂、现场机器人和城市更新运营组合为可交付的产品与服务。</p>
          {detailed && <p>从超高层钢结构到模块化建筑，产品能力沿着设计、制造、施工和运维四个环节持续延伸，并通过统一编码与数据平台实现贯通。</p>}
        </div>
        {detailed
          ? <OfficialLink href={companySources.products}>中建科工官网 · 产品中心</OfficialLink>
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
          <h2 id="company-practices-title">智能建造与城市更新实践</h2>
          <p>根据中建科工公开项目与业务资料整理，覆盖超高层、大跨度场馆、模块化建筑和既有城区更新。</p>
        </div>
        {detailed
          ? <OfficialLink href={companySources.cases}>中建科工官网 · 客户案例</OfficialLink>
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
        <p>从超高层钢结构施工能力，到建筑工业化、智能建造与城市更新一体化服务。</p>
        <OfficialLink href={companySources.about}>中建科工官网 · 企业介绍</OfficialLink>
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
          <h2 id="company-csna-title">产业人才培训与技术认证</h2>
          <p>中建科工把钢结构深化、智能建造和城市更新中的工程经验转化为培训与认证内容，面向院校和产业工人提供岗位能力培养路径。</p>
        </div>
        <OfficialLink href={companySources.about}>查看中建科工官网</OfficialLink>
      </div>
      <div className="ep-company-csna-grid">
        {trainingPrograms.map(({ code, name, detail }) => (
          <article key={code}>
            <GraduationCap size={22} strokeWidth={1.7} aria-hidden="true" />
            <strong>{code}</strong>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <div className="ep-company-training-note">
        <p>本平台将识图建模、工艺实施、现场施工、质量安全、成本进度和协作交付融入场景实训。学生先通过课程掌握方法，再用任务成果验证岗位能力。</p>
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
        <h2 id="company-contact-title">联系中建科工</h2>
        <p>产品咨询、运行支持与培训信息可通过中建科工官网及客户服务渠道获取。</p>
        <OfficialLink href={companySources.about}>查看中建科工官网</OfficialLink>
      </div>
      <dl>
        <div><dt>企业名称</dt><dd>中建科工集团有限公司</dd></div>
        <div><dt>总部</dt><dd>深圳市南山区</dd></div>
        <div><dt>核心业务</dt><dd>钢结构 · 装配式建筑 · 智能建造 · 城市更新</dd></div>
        <div><dt>校企合作</dt><dd>通过中建科工官网及产业学院渠道联系</dd></div>
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
          <h1 id="company-detail-title">关于中建科工</h1>
          <p>中建科工以钢结构为核心能力，面向智能建造与城市有机更新提供设计、制造、施工、检测与运营一体化服务。</p>
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
