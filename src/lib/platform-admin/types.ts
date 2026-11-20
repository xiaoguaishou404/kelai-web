export type ApprovalIdentity =
  | "departmentLead"
  | "majorLead"
  | "academicAffairs"
  | "resourceManager"
  | "expert"
  | "finance";

export const approvalIdentityLabels: Record<ApprovalIdentity, string> = {
  departmentLead: "院系负责人",
  majorLead: "专业负责人",
  academicAffairs: "教务管理员",
  resourceManager: "资源管理员",
  expert: "行业专家",
  finance: "财务审核",
};

export interface PlatformPageDefinition {
  id: string;
  label: string;
  description: string;
  entity: string;
  capabilities: ("create" | "edit" | "archive" | "approve" | "export")[];
}

export interface PlatformGroupDefinition {
  id: string;
  label: string;
  description: string;
  pages: PlatformPageDefinition[];
}

export interface PlatformDefinition {
  id: string;
  label: string;
  short: string;
  description: string;
  groups: PlatformGroupDefinition[];
}

export interface PlatformRecord {
  id: string;
  platformId: string;
  pageId: string;
  name: string;
  code: string;
  status: string;
  owner: string;
  updatedAt: string;
  data: Record<string, string | number | boolean>;
}

export interface ApprovalStep {
  id: string;
  name: string;
  identity: ApprovalIdentity;
  state: "pending" | "approved" | "rejected";
  actor?: string;
  note?: string;
  at?: string;
}

export interface ApprovalRequest {
  id: string;
  resourceId?: string;
  platformId: string;
  title: string;
  code: string;
  batchId?: string;
  flowId: string;
  submittedBy: string;
  submittedAt: string;
  status: "审批中" | "已通过" | "已驳回";
  currentStep: number;
  steps: ApprovalStep[];
}

export interface ApprovalBatch {
  id: string;
  platformId: string;
  name: string;
  code: string;
  flowId: string;
  status: "开放中" | "已截止";
  createdAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  platformId: string;
  name: string;
  description: string;
  steps: { name: string; identity: ApprovalIdentity }[];
}

export interface CertificateDefinition {
  id: string;
  name: string;
  category: "平台认证" | "行业认证" | "企业认证" | "职业技能等级";
  issuer: string;
  level: string;
  jobIds: string[];
  abilityCount: number;
  condition: string;
  format: string;
  examDate: string;
  status: "报名中" | "即将开放" | "未开放";
  sample: boolean;
}

export interface CertificateEnrollment {
  id: string;
  certificateId: string;
  studentId: string;
  status: "待审核" | "已报名" | "已通过" | "已驳回";
  submittedAt: string;
  note: string;
}

export interface ExamSchedule {
  id: string;
  assessmentId: string;
  name: string;
  classId: string;
  openAt: string;
  closeAt: string;
  durationMinutes: number;
  status: "待开始" | "进行中" | "已结束";
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources: string[];
  at: string;
}

export interface PlatformAdminState {
  reviewerIdentity: ApprovalIdentity;
  records: PlatformRecord[];
  workflows: ApprovalWorkflow[];
  batches: ApprovalBatch[];
  approvals: ApprovalRequest[];
  certificates: CertificateDefinition[];
  enrollments: CertificateEnrollment[];
  examSchedules: ExamSchedule[];
  aiMessages: AIChatMessage[];
}
