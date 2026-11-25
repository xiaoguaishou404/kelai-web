import { Image } from "@/components/router/image";

const illustratedResourceIds = new Set([
  "service", "security", "presales", "observability", "deployment", "operations",
  "nfr", "incident", "delivery", "solution",
  "bank", "energy", "hospital", "factory", "customer-scope", "delivery-defense",
  "asset-baseline", "dns-investigation", "security-defense", "baseline-analysis",
  "joint-troubleshooting", "observability-defense", "payment-peak", "cloud-migration",
  "ranch-encryption", "branch-cutover", "poc-value", "dc-change", "tap-quality",
  "trace-degradation", "incident-handoff",
]);

const jobCoverByCategory = new Map([
  ["网络分析", "deployment"],
  ["安全运营", "security"],
  ["解决方案", "presales"],
  ["可观测性", "observability"],
  ["技术服务", "service"],
]);

const jobCoverByIndustry = new Map([
  ["金融", "nfr"], ["能源", "security"], ["医疗", "observability"],
  ["制造", "deployment"], ["政务", "presales"], ["运营商", "operations"],
  ["云计算", "operations"],
]);

const sceneCoverByIndustry = new Map([
  ["金融", "bank"], ["能源", "energy"], ["医疗", "hospital"],
  ["制造", "factory"], ["政务", "incident-handoff"], ["运营商", "branch-cutover"],
  ["云计算", "dc-change"],
]);

export function ResourceCover({ id, kind, category = "", industry = "" }: {
  id: string;
  kind: "job" | "scene";
  category?: string;
  industry?: string;
}) {
  const fallbackId = kind === "job"
    ? jobCoverByCategory.get(category) ?? jobCoverByIndustry.get(industry) ?? "service"
    : sceneCoverByIndustry.get(industry) ?? "joint-troubleshooting";
  const coverId = illustratedResourceIds.has(id) ? id : fallbackId;

  return (
    <div className="ep-resource-cover">
      <Image
        src={`/resources/covers/${coverId}.webp?v=2`}
        alt=""
        fill
        sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
