import { TeachingResourceItem } from "@/lib/enterprise-workspace/types";

export const resource = (
  id: string,
  type: TeachingResourceItem["type"],
  title: string,
  description: string,
): TeachingResourceItem => ({ id, type, title, description });
