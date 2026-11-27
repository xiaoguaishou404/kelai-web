import {
  createResourceRights,
  nowLabel,
  seedWorkspace,
  type EnterpriseWorkspaceState,
  type Resource,
} from "@/lib/enterprise-workspace";
import { stripTrainingData, type LegacyWorkspaceMigration } from "./legacy-state";

export function migrateV3(
  legacyInput: LegacyWorkspaceMigration & { schemaVersion?: number; resources?: Resource[] },
): EnterpriseWorkspaceState {
  const legacy = stripTrainingData(legacyInput);
  const seed = seedWorkspace();
  const resources = (legacy.resources?.length ? legacy.resources : seed.resources).map((resource) => {
    const seeded = seed.resources.find((item) => item.id === resource.id);
    const fallback = seeded?.rights ?? createResourceRights(resource.id, {
      ownership: "科工自有",
      ownerName: "待补录权属人",
      sourceNote: "历史资源迁移，需补录来源与授权说明。",
      desensitizationNote: "尚未确认脱敏范围。",
      agreementNo: "",
      evidenceName: "",
      useScopes: [],
      status: "待确权",
      reviewNote: "历史资源需补录权属信息",
    });
    return {
      ...resource,
      rights: resource.rights ?? fallback,
    };
  });
  const existingIds = new Set(resources.map((item) => item.id));
  resources.push(...seed.resources.filter((item) => !existingIds.has(item.id)));
  return {
    ...seed,
    ...legacy,
    schemaVersion: 16,
    resources,
    majorGroups: seed.majorGroups,
  } as EnterpriseWorkspaceState;
}

export function migrateV2(legacyInput: LegacyWorkspaceMigration & { resources?: Array<Record<string, unknown>> }): EnterpriseWorkspaceState {
  const legacy = stripTrainingData(legacyInput);
  const seed = seedWorkspace();
  const legacyResources: Resource[] = (legacy.resources ?? [])
    .filter((item) => !seed.resources.some((resource) => resource.id === item.id))
    .flatMap((item) => {
      const id = String(item.id ?? crypto.randomUUID());
      const type = String(item.type ?? "岗位") as Resource["type"];
      const name = String(item.name ?? "待完善资源");
      const description = String(item.description ?? "");
      const relatedIds = Array.isArray(item.relatedIds) ? item.relatedIds.map(String) : [];
      const content = (() => {
        if (type === "场景") {
          return {
            kind: "scene" as const,
            data: {
              id,
              name,
              industry: "待完善",
              jobId: "",
              difficulty: "进阶",
              description,
              required: false,
              tasks: [],
              evidence: [],
              answer: "",
              abilityWeights: [0, 0, 0, 0, 0, 0],
              courseIds: [],
            },
          };
        }
        if (type === "课程") {
          return { kind: "course" as const, data: { id, name, jobId: "", sceneId: "", chapters: [] } };
        }
        if (type === "测评") {
          return { kind: "assessment" as const, data: { id, name, jobId: "", durationMinutes: 30, passScore: 60, questions: [] } };
        }
        if (type === "评价标准") {
          return {
            kind: "standard" as const,
            data: { id, name, jobId: "", abilityPointWeights: [], levelBands: [], recognitionRule: "" },
          };
        }
        return {
          kind: "job" as const,
          data: {
            id,
            name,
            category: "待完善",
            stage: "现场施工",
            industry: "待完善",
            description,
            skills: [],
            target: [0, 0, 0, 0, 0, 0],
            requiredDimensions: [],
          },
        };
      })();
      return [{
        id,
        name,
        type,
        status: "草稿" as const,
        description,
        version: String(item.version ?? "V1.0"),
        relatedIds,
        updatedAt: String(item.updatedAt ?? nowLabel()),
        draftContent: content,
        reviewHistory: [],
        rights: createResourceRights(id, {
          ownerName: "待补录权属人",
          sourceNote: "历史资源迁移，需补录来源与授权说明。",
          agreementNo: "",
          evidenceName: "",
          useScopes: [],
          status: "待确权",
          reviewNote: "历史资源需补录权属信息",
        }),
      }];
    });
  const v3 = {
    ...seed,
    role: legacy.role ?? null,
    teacherGuideSeen: legacy.teacherGuideSeen ?? false,
    works: legacy.works ?? seed.works,
    examAttempts: legacy.examAttempts ?? seed.examAttempts,
    certificates: legacy.certificates ?? seed.certificates,
    applications: legacy.applications ?? seed.applications,
    resume: legacy.resume ?? seed.resume,
    favorites: legacy.favorites ?? seed.favorites,
    auditEvents: legacy.auditEvents ?? seed.auditEvents,
    resources: [...seed.resources, ...legacyResources],
  } as EnterpriseWorkspaceState;
  return migrateV3(v3);
}
