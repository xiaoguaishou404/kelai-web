export type Role = "student" | "teacher" | "leader" | "operator";

export type AbilityKey =
  | "deploy"
  | "listen"
  | "path"
  | "locate"
  | "alert"
  | "report";

export type SubmissionStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "returned"
  | "passed";

export interface Ability {
  key: AbilityKey;
  name: string;
  required: boolean;
  summary: string;
}

export interface Person {
  id: string;
  name: string;
  role: Role;
  title: string;
  org: string;
}

export interface Career {
  id: string;
  title: string;
  summary: string;
  companyTypes: string[];
  skills: string[];
  abilities: AbilityKey[];
  certificate: string;
}

export interface Stage {
  id: string;
  title: string;
  prompt: string;
  drill?: { ask: string; choices: { text: string; right: boolean }[] };
}

export interface EvidenceItem {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface Challenge {
  id: string;
  code: string;
  title: string;
  scene: string;
  summary: string;
  abilities: AbilityKey[];
  required: boolean;
  difficulty: "基础" | "进阶" | "综合";
  minutes: number;
  version: string;
  stages: Stage[];
  criteria: string[];
  expertAnswer: string;
  pitfalls: string[];
  teacherGuide: string;
  tools: string[];
  sample: string;
  evidence: EvidenceItem[];
  labContext?: {
    businessChain: string[];
    protocols: string[];
    indicators: string[];
    visibility: string;
    deliverables: string[];
  };
}

export interface Review {
  score: number;
  tags: string[];
  defenseNote: string;
  comment: string;
  decision: "passed" | "returned";
  reviewedAt: string;
  criteriaMarks?: { text: string; mark: "supported" | "weak" }[];
}

export interface DesktopSession {
  startedAt: string;
  endedAt: string;
  minutes: number;
}

export interface Submission {
  id: string;
  challengeId: string;
  studentId: string;
  status: SubmissionStatus;
  completedStageIds: string[];
  deliverable: string;
  explanation: string;
  evidenceIds: string[];
  desktopMinutes: number;
  grantedMinutes?: number;
  resets: number;
  updatedAt: string;
  desktopSessions?: DesktopSession[];
  review?: Review;
  challengeSnapshot?: Challenge;
}

export interface ClassRoom {
  id: string;
  name: string;
  major: string;
  termLabel: string;
  teacherId: string;
  studentIds: string[];
}

export interface Tenant {
  id: string;
  code: string;
  school: string;
  college: string;
  region: string;
  plan: string;
  concurrent: number;
  renewal: string;
  status: "active" | "expiring";
  primary: boolean;
  quotaHours: number;
  environment: string;
  dataBoundary: string;
  mockUsedHours: number;
}

export interface EnvironmentState {
  version: string;
  contentRuntimeVersion: string;
  health: "healthy" | "degraded";
  capacity: number;
  samplePack: string;
  maintenance: boolean;
  timeoutMinutes: number;
  imageId?: string;
  collector?: string;
  samplePeriod?: string;
  sampleDigest?: string;
}

export type ContentWorkflowStage = "draft" | "pending" | "published" | "offline";

export interface ContentDraft {
  definition?: Challenge;
  challengeId: string;
  stage: ContentWorkflowStage;
  title: string;
  version: string;
  abilities: AbilityKey[];
  targetJobs: string;
  industries: string;
  scene: string;
  targetProblem: string;
  stageSummary: string;
  acceptanceMetrics: string;
  expertTemplate: string;
  requiredEnvironmentVersion: string;
  tenantIds: string[];
  updatedAt: string;
  publishedAt?: string;
}

export interface DemoState {
  demoDataRevision?: number;
  role: Role;
  teacherTrained: boolean;
  environmentChecked: boolean;
  challengePackConfirmed: boolean;
  selectedChallengeIds: string[];
  publishedChallengeIds: string[];
  submissions: Submission[];
  tenantQuotaHours: number;
  historicalMinutes: number;
  rosterImportedByClass: Record<string, boolean>;
  rosterImported?: boolean;
  updatePackRequested: boolean;
  updatePackConfirmed: boolean;
  localCaseRequested: boolean;
  localCaseQuoted: boolean;
  localCaseAccepted: boolean;
  environment: EnvironmentState;
  contentDrafts: Record<string, ContentDraft>;
  releasedContent?: Record<string, Challenge>;
  contentEvents?: { id: string; challengeId: string; action: string; version: string; at: string }[];
  seatRequest: number;
  seatsConfirmed: boolean;
}
