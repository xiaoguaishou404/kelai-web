import type { EnterpriseWorkspaceState } from "@/lib/enterprise-workspace";

type LegacyClassroom = EnterpriseWorkspaceState["classroom"] & {
  assignedTrainingIds?: string[];
};

type LegacyLearner = EnterpriseWorkspaceState["classmates"][number] & {
  completedDays?: number;
};

type LegacyTrainingFields = {
  completedDays?: number[];
  trainingProgress?: Record<string, number[]>;
};

export type LegacyWorkspaceData = EnterpriseWorkspaceState & LegacyTrainingFields & {
  classroom: LegacyClassroom;
  classmates: LegacyLearner[];
};

export type LegacyWorkspaceMigration = Partial<EnterpriseWorkspaceState> & LegacyTrainingFields & {
  classroom?: LegacyClassroom;
  classmates?: LegacyLearner[];
};

function stripRemovedCommerceData<T extends object>(legacy: T): T {
  const cleaned = { ...legacy } as Record<string, unknown>;
  delete cleaned.orders;
  delete cleaned.authorizations;
  if (Array.isArray(cleaned.resources)) {
    cleaned.resources = cleaned.resources.map((item) => {
      if (!item || typeof item !== "object") return item;
      const resource = { ...(item as Record<string, unknown>) };
      delete resource.packageId;
      delete resource.authorizedTo;
      return resource;
    });
  }
  return cleaned as T;
}

export function stripTrainingData<T extends LegacyWorkspaceMigration>(legacy: T): T {
  const cleaned = { ...legacy };
  delete cleaned.completedDays;
  delete cleaned.trainingProgress;

  if (cleaned.classroom) {
    const classroom = { ...cleaned.classroom };
    delete classroom.assignedTrainingIds;
    cleaned.classroom = classroom;
  }

  if (cleaned.classmates) {
    cleaned.classmates = cleaned.classmates.map((item) => {
      const learner = { ...item } as LegacyLearner;
      delete learner.completedDays;
      return learner;
    });
  }

  return stripRemovedCommerceData(cleaned);
}
