import { RecruitmentReturn } from "@/components/recruitment-return";
import type { ReactNode } from "react";
import "./learning.css";

export default function LearningLayout({ children }: { children: ReactNode }) {
  return <div className="learning-center"><RecruitmentReturn />{children}</div>;
}
