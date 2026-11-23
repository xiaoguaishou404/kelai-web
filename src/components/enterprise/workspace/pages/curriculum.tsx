"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, Search } from "lucide-react";
import { resourceName, resourceRightsBlockedReason, resourceVisible } from "@/lib/enterprise-workspace";
import { ChannelHero } from "@/components/enterprise/channel-hero";
import { enrichChapter, getChapterResources, textbooks } from "@/lib/resource-content";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, Tag } from "@/components/enterprise/workspace/ui";
import { ResourceCard } from "./public";

export function CoursesView() {
  const { courseById, courses, jobById, query, scenes, setQuery, state } = useWorkspacePage();
  const [courseMode, setCourseMode] = useState("全部");
  const visibleCourses = courses.filter((course) => resourceVisible(state, course.id));
  const visibleScenes = scenes.filter((scene) => resourceVisible(state, scene.id));
  const visiblePathCount = state.learningPaths.filter((path) => {
    const job = jobById(path.jobId);
    return Boolean(job && resourceVisible(state, job.id));
  }).length;
  const shownCourses = visibleCourses.filter(
    (course) =>
      (courseMode === "全部" || course.courseType === courseMode) &&
      `${course.name}${course.code ?? ""}${(course.majors ?? []).join("")}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shownTextbooks = textbooks.filter(
    (textbook) =>
      (courseMode === "全部" || courseMode === "数字教材") &&
      `${textbook.name}${textbook.code}${textbook.major}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <ChannelHero
        variant="courses"
        kicker="COURSE & TEXTBOOK"
        title="课程与教材资源馆"
        description="把岗位任务、方法内容与真实场景组织成可教、可练、可评价的动态课程体系。"
        metrics={[
          { label: "岗位课程", value: String(visibleCourses.length).padStart(2, "0") },
          { label: "课程章节", value: visibleCourses.reduce((sum, course) => sum + course.chapters.length, 0) },
          { label: "场景联动", value: String(visibleScenes.length).padStart(2, "0") },
          { label: "学习路径", value: String(visiblePathCount).padStart(2, "0") },
        ]}
      />
      <div className="ep-course-toolbar" id="course-browser">
        <div className="ep-tabs">
          {["全部", "体系课", "颗粒课", "混合课", "文化思政课", "数字教材"].map((item) => (
            <button className={courseMode === item ? "active" : ""} onClick={() => setCourseMode(item)} key={item}>{item}</button>
          ))}
        </div>
        <label className="ep-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索课程、教材或专业" /></label>
      </div>
      <div className="ep-grid ep-course-grid">
        {shownCourses.map((course, index) => (
          <Card key={course.id}>
            <div className={`ep-art art-${index}`}>
              <BookOpen size={64} />
              <span>{course.courseType ?? "岗位课程"}</span>
            </div>
            <div className="ep-cardbody">
              <div className="ep-chips"><Tag>{course.courseType ?? "体系课"}</Tag><Tag>{course.totalHours ?? course.chapters.length * 4} 学时</Tag></div>
              <h2>{resourceName(state, course.id, course.name)}</h2>
              <p>{course.chapters.length} 个章节 · {course.industry ?? jobById(course.jobId)?.industry ?? "通用"} · {course.chapters.reduce((sum, chapter) => sum + (chapter.resources?.length ?? 0), 0) || course.chapters.length * 5} 项资源</p>
              <Link className="ep-link" href={`/platform/course/${course.id}`}>进入课程 <ArrowUpRight size={16} /></Link>
            </div>
          </Card>
        ))}
        {courseMode !== "数字教材" && state.resources
          .filter((resource) => resource.type === "课程" && !courseById(resource.id) && resourceVisible(state, resource.id))
          .map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        {(courseMode === "全部" || courseMode === "数字教材") && shownTextbooks.map((textbook, index) => (
          <Card key={textbook.id}>
            <div className={`ep-art textbook-tone-${textbook.coverTone} art-${index}`}><BookOpen size={64} /><span>DIGITAL TEXTBOOK</span></div>
            <div className="ep-cardbody">
              <div className="ep-chips"><Tag>数字教材</Tag><Tag>{textbook.chapters.length} 章</Tag></div>
              <h2>{textbook.name}</h2>
              <p>{textbook.creator} · {textbook.major}</p>
              <Link className="ep-link" href={`/platform/textbook/${textbook.id}`}>打开教材 <ArrowUpRight size={16} /></Link>
            </div>
          </Card>
        ))}
      </div>
      {(courseMode !== "全部" && shownCourses.length === 0 && shownTextbooks.length === 0) && <Card><Empty>当前筛选下没有课程或教材。</Empty></Card>}
    </>
  );
}

export function CourseView({ id }: { id?: string }) {
  const { completeChapter, courseById, jobById, notify, selected, setSelected, state } = useWorkspacePage();
  const course = courseById(id ?? "course-0");
  if (!course) return <Empty>课程不存在。</Empty>;
  if (!resourceVisible(state, course.id) && state.role !== "manage" && state.role !== "schoolAdmin") {
    return <Empty>{resourceRightsBlockedReason(state, course.id, "教学使用") || "课程当前不可用于教学。"}</Empty>;
  }
  const chapterIndex = Math.min(selected, Math.max(0, course.chapters.length - 1));
  const chapter = enrichChapter(course.chapters[chapterIndex] ?? course.chapters[0], course, chapterIndex);
  const chapterResources = getChapterResources(course, chapterIndex);
  const completed = state.courseProgress[course.id] ?? [];
  return (
    <>
      <section className="ep-detail-hero">
        <div>
          <div className="ep-chips"><Tag>{course.courseType ?? "体系课"}</Tag><Tag>{course.totalHours ?? course.chapters.length * 4} 学时</Tag><Tag>{completed.length}/{course.chapters.length} 已完成</Tag></div>
          <h1>{resourceName(state, course.id, course.name)}</h1>
          <p>{course.industry ?? jobById(course.jobId)?.industry ?? "通用"} · {course.department ?? "数字媒体学院"} · 主编 {course.creator ?? "科来教学资源部"}</p>
        </div>
        {resourceVisible(state, course.sceneId) && <Link className="ep-button secondary" href={`/platform/scene/${course.sceneId}`}>进入关联场景<ArrowUpRight size={15} /></Link>}
      </section>
      <div className="ep-split ep-course-reader">
        <Card>
          <h2>课程目录</h2>
          {course.chapters.map((item, index) => (
            <button className={"ep-course-chapter " + (chapterIndex === index ? "active" : "")} onClick={() => setSelected(index)} key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><b>{item.title}</b><small>{getChapterResources(course, index).length} 项配套资源</small></div>
              {completed.includes(index) ? <CheckCircle2 size={16} /> : <ChevronRight size={15} />}
            </button>
          ))}
          {resourceVisible(state, course.jobId) && <Link className="ep-row" href={`/platform/job/${course.jobId}`}><span className="ep-grow">返回关联岗位<small>{jobById(course.jobId)?.name}</small></span><ChevronRight size={15} /></Link>}
        </Card>
        <Card>
          <Tag>第 {chapterIndex + 1} 章</Tag><h1>{chapter.title}</h1><p>{chapter.content}</p>
          <h2>学习目标</h2>
          <div className="ep-objectives">{(chapter.objectives ?? []).map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div>
          <h2>方法与要点</h2><p>{chapter.method}</p>
          <div className="ep-chips">{(chapter.points ?? []).map((item) => <Tag key={item}>{item}</Tag>)}</div>
          <h2>章节资源</h2>
          <div className="ep-chapter-resources">
            {chapterResources.map((item) => (
              <details key={item.id}>
                <summary><span>{item.type}</span><b>{item.title}</b><ChevronRight size={14} /></summary>
                <p>{item.description}</p>
              </details>
            ))}
          </div>
          <div className="ep-actions">
            {state.role === "student" && (
              <Btn
                disabled={completed.includes(chapterIndex)}
                onClick={() => {
                  completeChapter(course.id, chapterIndex);
                  notify(`第 ${chapterIndex + 1} 章学习记录已保存`);
                }}
              >
                {completed.includes(chapterIndex) ? "本章已完成" : "完成本章"}
              </Btn>
            )}
            {chapterIndex < course.chapters.length - 1 && <Btn secondary onClick={() => setSelected(chapterIndex + 1)}>下一章</Btn>}
          </div>
        </Card>
      </div>
    </>
  );
}

export function TextbookView({ id }: { id: string }) {
  const { selected, setSelected } = useWorkspacePage();
  const textbook = textbooks.find((item) => item.id === id);
  if (!textbook) return <Empty>数字教材不存在。</Empty>;
  const chapterIndex = Math.min(selected, textbook.chapters.length - 1);
  const chapter = enrichChapter(
    textbook.chapters[chapterIndex],
    {
      id: textbook.id,
      name: textbook.name,
      jobId: "",
      sceneId: "",
      chapters: textbook.chapters,
    },
    chapterIndex,
  );
  const resources = chapter.resources ?? [];
  return (
    <>
      <section className="ep-detail-hero">
        <div><div className="ep-chips"><Tag>数字教材</Tag><Tag>{textbook.code}</Tag></div><h1>{textbook.name}</h1><p>{textbook.creator} · {textbook.industry} · {textbook.major}</p></div>
        <Link className="ep-button secondary" href="/platform/courses">返回课程与教材<ChevronRight size={15} /></Link>
      </section>
      <div className="ep-split ep-textbook-reader">
        <Card>
          <h2>教材目录</h2>
          {textbook.chapters.map((item, index) => (
            <button className={"ep-course-chapter " + (chapterIndex === index ? "active" : "")} onClick={() => setSelected(index)} key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span><div><b>{item.title}</b><small>第 {index + 1} / {textbook.chapters.length} 章</small></div><ChevronRight size={15} />
            </button>
          ))}
        </Card>
        <Card className="ep-book-page">
          <small>{textbook.code} · CHAPTER {String(chapterIndex + 1).padStart(2, "0")}</small>
          <h1>{chapter.title}</h1><p>{chapter.content}</p>
          <h2>本章目标</h2><div className="ep-objectives">{(chapter.objectives ?? []).map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div>
          <h2>方法与练习</h2><p>{chapter.method}</p>
          <div className="ep-chapter-resources">{resources.map((item) => <details key={item.id}><summary><span>{item.type}</span><b>{item.title}</b><ChevronRight size={14} /></summary><p>{item.description}</p></details>)}</div>
        </Card>
      </div>
    </>
  );
}
