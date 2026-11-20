import { PlatformAdminState } from "@/lib/platform-admin/types";

export const WORKSPACE_STORAGE_KEY = "colasoft-enterprise-v5";
export const LEGACY_WORKSPACE_STORAGE_KEY = "colasoft-enterprise-v3";

export const dimensions = ["环境部署", "需求理解", "链路分析", "故障定位", "安全研判", "交付汇报"];

export type Role = "student" | "teacher" | "schoolAdmin" | "manage";
export type ResourceType = "岗位" | "场景" | "课程" | "教材" | "测评" | "评价标准";
export type ResourceStatus = "草稿" | "待审核" | "已通过" | "已发布" | "已下线" | "已驳回" | "已归档";
export type ResourceRightsStatus = "待确权" | "审核中" | "已确权" | "已驳回" | "已过期";
export type ResourceOwnership = "科来自有" | "客户授权" | "校企共建" | "公开资料改编";
export type ResourceUseScope = "教学使用" | "实训交付" | "项目展示" | "招聘引用";
export type WorkStatus = "待评价" | "已通过" | "已退回";
export type TaskSubmissionStatus = "草稿" | "待评价" | "已通过" | "已退回";
export type SceneProgressStatus = "未开始" | "学习中" | "待评价" | "已完成";
export type SceneDeliveryMode = "线上" | "线下" | "混合";
export type SceneAssessmentType = "随堂测" | "作品评审" | "实操考核" | "现场答辩" | "线下课堂" | "题库";
export type SceneAssessmentStatus = "未开始" | "待提交" | "待评价" | "已通过" | "已退回";
export type ApplicationKind = "project" | "job";
export type ApplicationStatus =
  | "待审核"
  | "已驳回"
  | "已接单"
  | "待验收"
  | "已退回"
  | "已验收"
  | "待面试"
  | "已录用"
  | "未通过";

export interface Evidence {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface JobProfile {
  id: string;
  name: string;
  code?: string;
  category: string;
  stage: string;
  industry: string;
  description: string;
  majors?: string[];
  majorGroupIds?: string[];
  responsibilities?: string[];
  requirements?: string[];
  certificates?: string[];
  aliases?: string[];
  salaryRange?: string;
  careerPaths?: string[];
  knowledgePointIds?: string[];
  recommended?: boolean;
  publishedAt?: string;
  skills: string[];
  target: number[];
  requiredDimensions: number[];
  tasks?: JobTask[];
  abilityPoints?: AbilityPoint[];
  sceneIds?: string[];
  courseIds?: string[];
  assessmentIds?: string[];
  standardIds?: string[];
  buildMode?: "独立建设" | "校企共建";
  schoolIds?: string[];
}

export interface JobTask {
  id: string;
  name: string;
  description: string;
  abilityPointIds: string[];
}

export interface AbilityPoint {
  id: string;
  name: string;
  domain: string;
  dimension: number;
  level: string;
  weight: number;
}

export interface SceneProfile {
  id: string;
  name: string;
  industry: string;
  jobId: string;
  difficulty: string;
  description: string;
  required: boolean;
  tasks: string[];
  evidence: Evidence[];
  answer: string;
  abilityWeights: number[];
  courseIds: string[];
  code?: string;
  department?: string;
  majors?: string[];
  learningGoal?: string;
  taskDetails?: SceneTaskDetail[];
  resourceItems?: TeachingResourceItem[];
  abilityPointIds?: string[];
  evaluationStandardId?: string;
  knowledgePointIds?: string[];
}

export interface SceneTaskDetail {
  id: string;
  title: string;
  description: string;
  type: "训练" | "测评" | "复盘";
  minutes: number;
  goal: string;
  evidenceIds: string[];
  resources: TeachingResourceItem[];
  abilityPointIds: string[];
  weight: number;
  required: boolean;
  requiredEvidenceIds: string[];
  deliverable: string;
  rubric: TaskRubricItem[];
  deliveryMode: SceneDeliveryMode;
  assessmentMethods: SceneAssessmentMethod[];
}

export interface SceneAssessmentMethod {
  id: string;
  type: SceneAssessmentType;
  title: string;
  description: string;
  mode: SceneDeliveryMode;
  weight: number;
  required: boolean;
  passScore: number;
}

export interface TaskAssessmentResult {
  id: string;
  methodId: string;
  type: SceneAssessmentType;
  status: SceneAssessmentStatus;
  score?: number;
  submittedAt?: string;
  reviewer?: string;
  comment: string;
}

export interface TaskRubricItem {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface TeachingResourceItem {
  id: string;
  type: "视频" | "文档" | "图片" | "习题" | "思维导图" | "知识图谱" | "录音";
  title: string;
  description: string;
}

export interface CourseChapter {
  title: string;
  content: string;
  method: string;
  objectives?: string[];
  points?: string[];
  resources?: TeachingResourceItem[];
}

export interface CourseProfile {
  id: string;
  name: string;
  jobId: string;
  sceneId: string;
  courseType?: "体系课" | "颗粒课" | "混合课" | "文化思政课";
  totalHours?: number;
  abilityPointIds?: string[];
  code?: string;
  industry?: string;
  department?: string;
  majors?: string[];
  creator?: string;
  views?: number;
  chapters: CourseChapter[];
}

export interface TextbookProfile {
  id: string;
  name: string;
  code: string;
  creator: string;
  industry: string;
  major: string;
  coverTone: "blue" | "teal" | "amber" | "violet" | "navy";
  chapters: CourseChapter[];
}

export interface AssessmentProfile {
  id: string;
  name: string;
  code?: string;
  jobId: string;
  standardId?: string;
  kind?: "题库" | "试卷";
  difficulty?: "入门" | "初级" | "中级" | "高级" | "专家";
  publisher?: string;
  abilityPointCount?: number;
  averageScore?: number;
  usageCount?: number;
  durationMinutes: number;
  passScore: number;
  questions: Question[];
}

export interface StandardProfile {
  id: string;
  name: string;
  code?: string;
  jobId: string;
  abilityPointWeights: { id: string; name: string; weight: number; level: string }[];
  levelBands: { level: string; min: number; max: number }[];
  recognitionRule: string;
  evidenceWeight?: number;
  reasoningWeight?: number;
  deliveryWeight?: number;
  passScore?: number;
  goodScore?: number;
  excellentScore?: number;
}

export interface ResourceReviewRecord {
  id: string;
  action: "提交审核" | "发布" | "驳回" | "下线" | "新版本";
  actor: string;
  note: string;
  at: string;
}

export interface ResourceRights {
  ownership: ResourceOwnership;
  ownerName: string;
  sourceNote: string;
  desensitizationNote: string;
  agreementNo: string;
  evidenceName: string;
  useScopes: ResourceUseScope[];
  validFrom: string;
  validUntil: string;
  status: ResourceRightsStatus;
  reviewNote: string;
  history: AuditEvent[];
}

export type ResourceContent =
  | { kind: "job"; data: JobProfile }
  | { kind: "scene"; data: SceneProfile }
  | { kind: "course"; data: CourseProfile }
  | { kind: "assessment"; data: AssessmentProfile }
  | { kind: "standard"; data: StandardProfile };

export interface Question {
  id: string;
  title: string;
  options: string[];
  answer: number;
  type?: "单选" | "多选" | "判断" | "填空" | "简答" | "问答" | "实操" | "答辩";
  difficulty?: string;
  score?: number;
  abilityPointIds?: string[];
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  description: string;
  version: string;
  relatedIds: string[];
  reviewNote?: string;
  updatedAt: string;
  draftContent: ResourceContent;
  publishedContent?: ResourceContent;
  reviewHistory: ResourceReviewRecord[];
  rights: ResourceRights;
  code?: string;
  batchId?: string;
  archivedAt?: string;
  publishedAt?: string;
  recommended?: boolean;
}

export interface MajorGroup {
  id: string;
  code: string;
  name: string;
  schoolIds: string[];
  majors: string[];
  jobIds: string[];
  description: string;
  updatedAt: string;
}

export interface Review {
  evidenceScore: number;
  reasoningScore: number;
  deliveryScore: number;
  total: number;
  tags: string[];
  comment: string;
  decision: "passed" | "returned";
  reviewer: string;
  reviewedAt: string;
}

export interface TaskReview {
  id: string;
  reviewer: string;
  reviewedAt: string;
  decision: "passed" | "returned";
  total: number;
  comment: string;
  tags: string[];
  scores: { rubricId: string; label: string; score: number; weight: number }[];
}

export interface TaskSubmission {
  id: string;
  studentId: string;
  studentName: string;
  sceneId: string;
  taskId: string;
  status: TaskSubmissionStatus;
  evidenceIds: string[];
  worksheet: string;
  answer: string;
  analysis: string;
  nextStep: string;
  boundaryAcknowledged: boolean;
  submittedAt?: string;
  updatedAt: string;
  reviews: TaskReview[];
  assessmentResults: TaskAssessmentResult[];
  history: AuditEvent[];
}

export interface JobLearningPathNode {
  id: string;
  sceneId: string;
  phase: string;
  required: boolean;
}

export interface JobLearningPath {
  id: string;
  jobId: string;
  name: string;
  description: string;
  version: string;
  sceneNodes: JobLearningPathNode[];
}

export interface OfflineSession {
  id: string;
  sceneId: string;
  taskId?: string;
  classId: string;
  title: string;
  location: string;
  teacher: string;
  startAt: string;
  endAt: string;
  mode: SceneDeliveryMode;
  status: "待开始" | "进行中" | "已结束";
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "已签到" | "迟到" | "缺席";
  checkedAt: string;
}

export interface SceneCompletion {
  id: string;
  studentId: string;
  sceneId: string;
  status: SceneProgressStatus;
  completedTaskIds: string[];
  requiredTaskIds: string[];
  score?: number;
  completedAt?: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  note: string;
}

export interface Work {
  id: string;
  studentId: string;
  studentName: string;
  sceneId: string;
  status: WorkStatus;
  analysis: string;
  nextStep: string;
  evidenceIds: string[];
  boundaryAcknowledged: boolean;
  submittedAt: string;
  updatedAt: string;
  reviews: Review[];
  history: AuditEvent[];
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  jobId: string;
  assessmentId?: string;
  assessmentName?: string;
  assessmentKind?: "题库" | "试卷";
  answers: number[];
  score: number;
  passScore?: number;
  passed: boolean;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  number: string;
  studentId: string;
  jobId: string;
  issuedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  major: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  studentIds: string[];
}

export interface SampleLearner {
  id: string;
  name: string;
  classId: string;
  abilityScores: number[];
  passed: number;
  pending: number;
  returned: number;
  readOnly: true;
}

export interface Resume {
  name: string;
  phone: string;
  education: string;
  summary: string;
}

export interface ProjectPosting {
  id: string;
  name: string;
  company: string;
  description: string;
  deliverables: string[];
  acceptance: string[];
  schoolIds: string[];
  jobId: string;
  minMatch: number;
  deadline: string;
  status: "已发布" | "已下线";
  code?: string;
  category?: string;
  workStatus?: "待接单" | "进行中" | "已完成";
  teamSize?: number;
  duration?: string;
  reward?: string;
  deliveryMode?: "远程" | "驻场" | "混合";
  outcome?: string;
}

export interface JobPosting {
  id: string;
  name: string;
  company: string;
  description: string;
  jobId: string;
  minMatch: number;
  industry?: string;
  city?: string;
  employmentType?: "全职" | "实习" | "远程";
  experience?: string;
  education?: string;
  salaryMin?: number;
  salaryMax?: number;
  companySize?: string;
  companyType?: string;
  publishedDaysAgo?: number;
  matchHighlight?: string;
  responsibilities?: string[];
  requirements?: string[];
  status: "已发布" | "已下线";
}

export interface Application {
  id: string;
  kind: ApplicationKind;
  targetId: string;
  name: string;
  company: string;
  studentId: string;
  studentName: string;
  status: ApplicationStatus;
  resumeSnapshot?: Resume;
  deliveryText?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  history: AuditEvent[];
}

export interface School {
  id: string;
  name: string;
  college: string;
  plan: string;
  contact: string;
  status: string;
}

export interface EnterpriseWorkspaceState {
  schemaVersion: 12;
  role: Role | null;
  activeSchoolId: string;
  activeStudentId: string;
  activeTeacherId: string;
  teacherGuideSeen: boolean;
  resources: Resource[];
  majorGroups: MajorGroup[];
  classroom: Classroom;
  classmates: SampleLearner[];
  works: Work[];
  taskSubmissions: TaskSubmission[];
  sceneCompletions: SceneCompletion[];
  learningPaths: JobLearningPath[];
  offlineSessions: OfflineSession[];
  attendanceRecords: AttendanceRecord[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  projects: ProjectPosting[];
  jobPostings: JobPosting[];
  applications: Application[];
  schools: School[];
  resume: Resume;
  favorites: string[];
  standardWeights: number[];
  auditEvents: AuditEvent[];
  courseProgress: Record<string, number[]>;
  platformAdmin: PlatformAdminState;
}
