import type { ReactNode } from "react";
import { ManageApplications } from "@/components/enterprise/workspace/pages/operations";
import { TenantPanel } from "./catalog-panels";

export function renderServicePage(platformId: string, pageId: string): ReactNode | null {
  if (platformId !== "alliance") return null;
  if (pageId === "school") return <TenantPanel heading="学校信息" subtitle="服务院校的基础资料、联系人与服务状态。" />;
  if (pageId === "projects") return <ManageApplications kind="project" hideTitle />;
  if (pageId === "employment-job") return <ManageApplications kind="job" hideTitle />;
  return null;
}
