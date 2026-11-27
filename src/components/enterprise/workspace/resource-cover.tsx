import { Image } from "@/components/router/image";

const coverByCategory = new Map([
  ["数字设计", "highrise"],
  ["智能建造", "site"],
  ["模块化建筑", "modular"],
  ["城市更新", "renewal"],
  ["装配式建筑", "factory"],
  ["钢结构施工", "highrise"],
  ["数字建造", "site"],
  ["工程管理", "bridge"],
  ["建筑工业化", "factory"],
  ["建筑数字化", "site"],
  ["建筑", "highrise"],
  ["建筑工业化", "modular"],
]);

const coverByIndustry = new Map([
  ["超高层", "highrise"],
  ["场馆", "venue"],
  ["城市更新", "renewal"],
  ["既有建筑", "retrofit"],
  ["模块化", "modular"],
  ["智能工厂", "factory"],
  ["智慧工地", "site"],
  ["基础设施", "bridge"],
  ["建筑", "highrise"],
  ["建筑工业化", "modular"],
  ["建筑数字化", "site"],
]);

const sceneCoverById = new Map([
  ["bank", "highrise"],
  ["payment-peak", "venue"],
  ["factory", "modular"],
  ["energy", "factory"],
  ["cloud-migration", "renewal"],
  ["ranch-encryption", "renewal"],
  ["hospital", "retrofit"],
  ["branch-cutover", "site"],
  ["poc-value", "modular"],
  ["dc-change", "site"],
  ["tap-quality", "factory"],
  ["trace-degradation", "site"],
  ["incident-handoff", "bridge"],
  ["customer-scope", "renewal"],
  ["delivery-defense", "renewal"],
  ["asset-baseline", "retrofit"],
  ["dns-investigation", "retrofit"],
  ["security-defense", "retrofit"],
  ["baseline-analysis", "bridge"],
  ["joint-troubleshooting", "site"],
  ["observability-defense", "site"],
]);

const jobCoverById = new Map([
  ["service", "highrise"],
  ["security", "site"],
  ["presales", "modular"],
  ["observability", "renewal"],
  ["deployment", "factory"],
  ["operations", "highrise"],
  ["nfr", "site"],
  ["incident", "retrofit"],
  ["delivery", "bridge"],
  ["solution", "site"],
]);

export function ResourceCover({ id, kind, category = "", industry = "" }: {
  id: string;
  kind: "job" | "scene";
  category?: string;
  industry?: string;
}) {
  const fallbackId = kind === "job"
    ? coverByCategory.get(category) ?? coverByIndustry.get(industry) ?? "highrise"
    : coverByIndustry.get(industry) ?? "highrise";
  const coverId = (kind === "job" ? jobCoverById.get(id) : sceneCoverById.get(id)) ?? fallbackId;

  return (
    <div className="ep-resource-cover">
      <Image
        src={`/resources/covers/zjkg/${coverId}.svg`}
        alt=""
        fill
        sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
