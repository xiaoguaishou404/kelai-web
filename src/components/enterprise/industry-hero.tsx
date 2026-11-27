import { Image } from "@/components/router/image";
import { Link } from "@/components/router/link";

export function IndustryHero() {
  return (
    <section className="ep-industry-hero ep-full-bleed" aria-labelledby="industry-hero-title">
      <Image
        className="ep-industry-hero-visual"
        src="/brand/zjkg-hero.svg"
        alt=""
        fill
        sizes="100vw"
        priority
      />
      <div className="ep-industry-hero-inner">
        <p className="ep-industry-hero-kicker">智能建造 · 城市有机更新</p>
        <h1 id="industry-hero-title">中建科工</h1>
        <p className="ep-industry-hero-description">以钢结构为骨、以智能建造为翼，把工程一线的真实场景转化为可学习、可实训、可评价的岗位能力。</p>
        <div className="ep-industry-hero-actions">
          <Link className="ep-industry-hero-primary" href="/platform/resources">探索岗位与场景</Link>
          <Link className="ep-industry-hero-secondary" href="/platform/industry/company">了解中建科工</Link>
        </div>
      </div>
    </section>
  );
}
