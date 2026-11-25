import { ResourceType } from "@/lib/enterprise-workspace";
import { BuilderProps } from "./shared";
import { JobBuilder } from "./job-builder";
import { SceneBuilder } from "./scene-builder";
import { CourseBuilder } from "./course-builder";
import { TextbookBuilder } from "./textbook-builder";
import { AssessmentBuilder } from "./assessment-builder";
import { StandardBuilder } from "./standard-builder";

export function ResourceBuilder(props: BuilderProps & { kind?: ResourceType }) {
  const content = props.resource?.draftContent;
  const kind = content?.kind ?? (
    props.kind === "场景" ? "scene" :
      props.kind === "课程" ? "course" :
        props.kind === "教材" ? "textbook" :
          props.kind === "测评" ? "assessment" :
            props.kind === "评价标准" ? "standard" : "job"
  );
  if (kind === "job") return <JobBuilder {...props} initial={content?.kind === "job" ? content.data : undefined} />;
  if (kind === "scene") return <SceneBuilder {...props} initial={content?.kind === "scene" ? content.data : undefined} />;
  if (kind === "course") return <CourseBuilder {...props} initial={content?.kind === "course" ? content.data : undefined} />;
  if (kind === "textbook") return <TextbookBuilder {...props} initial={content?.kind === "textbook" ? content.data : undefined} />;
  if (kind === "assessment") return <AssessmentBuilder {...props} initial={content?.kind === "assessment" ? content.data : undefined} />;
  return <StandardBuilder {...props} initial={content?.kind === "standard" ? content.data : undefined} />;
}
