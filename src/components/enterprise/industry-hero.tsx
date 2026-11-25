import { Image } from "@/components/router/image";
import { Link } from "@/components/router/link";

export function IndustryHero() {
  return (
    <section className="ep-industry-hero ep-full-bleed" aria-labelledby="industry-hero-title">
      <Image
        className="ep-industry-hero-visual"
        src="/brand/colasoft-fiber-hero-ice-blue.webp"
        alt=""
        fill
        sizes="100vw"
        priority
      />
      <div className="ep-industry-hero-inner">
        <p className="ep-industry-hero-kicker">场景化产教融合平台</p>
        <h1 id="industry-hero-title">科来网络</h1>
        <p className="ep-industry-hero-description">将网络流量分析与云网可观测的一线经验，转化为可学习、可实训、可评价的岗位能力。</p>
        <div className="ep-industry-hero-actions">
          <Link className="ep-industry-hero-primary" href="/platform/resources">探索岗位与场景</Link>
          <Link className="ep-industry-hero-secondary" href="/platform/industry/company">了解科来</Link>
        </div>
      </div>
    </section>
  );
}
