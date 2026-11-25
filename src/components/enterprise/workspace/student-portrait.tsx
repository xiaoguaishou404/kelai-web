import { Link } from "@/components/router/link";
import { useEffect, useId, useMemo, useRef, useState, type Ref } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  Award, BadgeCheck, BriefcaseBusiness, ClipboardList, Download, GraduationCap,
  Layers3, Maximize, Minimize, Printer, Radar, ScanLine, TrendingUp,
} from "lucide-react";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { dimensions } from "@/lib/enterprise-workspace";
import { buildStudentPortrait, type StudentPortraitData } from "./student-portrait-data";

type Presentation = "fullscreen" | "dialog" | null;

export function StudentPortrait({ admin = false }: { admin?: boolean }) {
  const { state } = useWorkspace();
  const [selectedId, setSelectedId] = useState("");
  const [presentation, setPresentation] = useState<Presentation>(null);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const reportView = useRef<HTMLDivElement>(null);
  const exportReport = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const students = admin ? state.studentRecords.filter((item) => item.schoolId === state.activeSchoolId) : [];
  const student = admin
    ? students.find((item) => item.id === (selectedId || state.activeStudentId)) ?? students[0]
    : state.studentRecords.find((item) => item.id === state.activeStudentId);
  const studentId = student?.id ?? state.activeStudentId;
  const report = useMemo(() => buildStudentPortrait(state, studentId, student), [state, studentId, student]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const open = document.fullscreenElement === reportView.current;
      setPresentation((current) => open ? "fullscreen" : current === "fullscreen" ? null : current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function closePresentation() {
    if (document.fullscreenElement === reportView.current) {
      await document.exitFullscreen();
    }
    if (dialog.current?.open) dialog.current.close();
    setPresentation(null);
  }

  async function togglePresentation() {
    if (presentation) {
      await closePresentation();
      fullscreenButton.current?.focus();
      return;
    }
    if (document.fullscreenEnabled && reportView.current?.requestFullscreen) {
      try {
        await reportView.current.requestFullscreen();
        setPresentation("fullscreen");
        return;
      } catch {
        // Use the viewport-sized dialog when the browser disallows native fullscreen.
      }
    }
    flushSync(() => setPresentation("dialog"));
    dialog.current?.showModal();
  }

  async function printReport() {
    if (presentation) await closePresentation();
    window.print();
  }

  async function downloadReport() {
    if (exporting) return;
    setMessage("");
    flushSync(() => setExporting(true));
    try {
      const { toBlob } = await import("html-to-image");
      await document.fonts.ready;
      const node = exportReport.current;
      const blob = node && await toBlob(node, { pixelRatio: 2, backgroundColor: "#f3f6fc", skipFonts: true });
      if (!blob) throw new Error("PNG encoding failed");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name.replace(/[\\/:*?"<>|]/g, "-")}-学生能力画像.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      setMessage("图片导出失败，请重试。");
    } finally {
      setExporting(false);
    }
  }

  const toolbar = (inDialog = false) => (
    <div className="ep-student-portrait-toolbar">
      <div className="ep-student-portrait-title">
        <h1>学生能力画像</h1>
        {admin && students.length > 0 && (
          <select aria-label="选择学生" value={studentId} onChange={(event) => setSelectedId(event.target.value)}>
            {students.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.studentNo}</option>)}
          </select>
        )}
      </div>
      <div className="ep-student-portrait-controls">
        <button ref={inDialog ? undefined : fullscreenButton} type="button" onClick={togglePresentation}>
          {presentation ? <Minimize size={16} aria-hidden="true" /> : <Maximize size={16} aria-hidden="true" />}
          {presentation ? "退出全屏" : "全屏展示"}
        </button>
        <button type="button" onClick={printReport}><Printer size={16} aria-hidden="true" />打印</button>
        <button className="ep-student-portrait-download" type="button" onClick={downloadReport} disabled={exporting}>
          <Download size={16} aria-hidden="true" />{exporting ? "正在生成…" : "导出图片"}
        </button>
      </div>
      {message && <p className="ep-student-portrait-error" role="status">{message}</p>}
    </div>
  );

  if (admin && !student) return <p className="ep-student-report-empty">当前院校暂无学生。</p>;

  return (
    <div className="ep-student-portrait">
      <div className="ep-student-portrait-view" ref={reportView}>
        <PortraitBackdrop />
        <div className="ep-student-portrait-layout">
          {toolbar()}
          <PortraitReport report={report} />
        </div>
      </div>
      <dialog className="ep-student-portrait-dialog" ref={dialog} aria-label="学生能力画像全屏展示" onClose={() => {
        setPresentation(null);
        fullscreenButton.current?.focus();
      }}>
        {presentation === "dialog" && (
          <div className="ep-student-portrait-layout">
            {toolbar(true)}
            <PortraitReport report={report} />
          </div>
        )}
      </dialog>
      {exporting && createPortal(
        <div className="ep-student-report-export" aria-hidden="true" inert>
          <PortraitReport report={report} reportRef={exportReport} />
        </div>,
        document.body,
      )}
    </div>
  );
}

const BACKDROP_ICONS = [
  { id: "pbd-target", x: 620, y: 80, scale: 7.2, weight: 4.6, flip: false, color: "#e08a3c", opacity: .7 },
  { id: "pbd-book", x: 1340, y: 340, scale: 6, weight: 4.5, flip: true, color: "#2f6fd0", opacity: .7 },
  { id: "pbd-cloud", x: 90, y: 1080, scale: 6.4, weight: 4.4, flip: false, color: "#0f9db5", opacity: .6 },
  { id: "pbd-chart", x: 1180, y: 1000, scale: 3.4, weight: 4.4, flip: true, color: "#0f9db5", opacity: .85 },
  { id: "pbd-server", x: 1050, y: 180, scale: 3.2, weight: 4.4, flip: false, color: "#7a5cf0", opacity: .75 },
  { id: "pbd-radar", x: 950, y: 720, scale: 3, weight: 4.2, flip: false, color: "#2e9a76", opacity: .8 },
  { id: "pbd-trophy", x: 180, y: 760, scale: 3.2, weight: 4.2, flip: false, color: "#d9a21b", opacity: .75 },
  { id: "pbd-shield", x: 150, y: 560, scale: 1.9, weight: 4.2, flip: false, color: "#2e9a76", opacity: .95 },
  { id: "pbd-pulse", x: 400, y: 1120, scale: 1.8, weight: 4.2, flip: false, color: "#7a5cf0", opacity: .9 },
  { id: "pbd-badge", x: 430, y: 1280, scale: 2, weight: 4, flip: true, color: "#d95c8a", opacity: .8 },
  { id: "pbd-route", x: 760, y: 420, scale: 1.7, weight: 4, flip: false, color: "#2f6fd0", opacity: .7 },
  { id: "pbd-link", x: 1200, y: 1220, scale: 1.9, weight: 4, flip: false, color: "#0f9db5", opacity: .75 },
  { id: "pbd-radar", x: 180, y: 1240, scale: 1.6, weight: 4, flip: true, color: "#7a5cf0", opacity: .65 },
  { id: "pbd-chart", x: 60, y: 300, scale: 1.8, weight: 4.2, flip: false, color: "#2e9a76", opacity: .7 },
  { id: "pbd-cloud", x: 820, y: 1260, scale: 2.2, weight: 4.2, flip: true, color: "#2f6fd0", opacity: .7 },
  { id: "pbd-target", x: 1290, y: 780, scale: 1.7, weight: 4, flip: false, color: "#e08a3c", opacity: .6 },
];

const BACKDROP_DOTS = [
  { x: 340, y: 380, r: 2.8, color: "#e08a3c", opacity: .75 },
  { x: 820, y: 520, r: 2.2, color: "#7a5cf0", opacity: .7 },
  { x: 1100, y: 880, r: 2.4, color: "#0f9db5", opacity: .75 },
  { x: 200, y: 880, r: 2, color: "#2f6fd0", opacity: .65 },
  { x: 560, y: 660, r: 2.2, color: "#d95c8a", opacity: .6 },
  { x: 960, y: 60, r: 1.8, color: "#2e9a76", opacity: .6 },
];

function PortraitBackdrop() {
  return (
    <svg className="ep-student-portrait-backdrop" aria-hidden="true" focusable="false">
      <defs>
        <g id="pbd-cloud">
          <path d="M7 18h10a3.8 3.8 0 0 0 .5-7.57A5.4 5.4 0 0 0 7.2 9.3 4.3 4.3 0 0 0 7 18Z" />
        </g>
        <g id="pbd-server">
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
          <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
        </g>
        <g id="pbd-trophy">
          <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
          <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
          <path d="M12 13v4M9 20h6" />
        </g>
        <g id="pbd-route">
          <circle cx="5" cy="6" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M7 6h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8" />
        </g>
        <g id="pbd-link">
          <path d="M9.5 14.5 14.5 9.5" />
          <path d="M11 6.5 12.5 5a3.5 3.5 0 0 1 5 5L16 11.5" />
          <path d="M13 17.5 11.5 19a3.5 3.5 0 0 1-5-5L8 12.5" />
        </g>
        <g id="pbd-radar">
          <path d="M12 2.5 20 7.2v9.6L12 21.5 4 16.8V7.2Z" />
          <path d="M12 2.5v19M4 7.2l16 9.6M20 7.2 4 16.8" />
          <circle cx="12" cy="12" r="2" />
        </g>
        <g id="pbd-chart">
          <path d="M3 20h18" />
          <path d="M6 20v-6M11 20v-9M16 20v-4M21 20V7" />
          <path d="M14.5 7H21v6.5" />
        </g>
        <g id="pbd-shield">
          <path d="M12 3 20 6v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6Z" />
          <path d="m8.6 12 2.4 2.4 4.4-5" />
        </g>
        <g id="pbd-book">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z" />
        </g>
        <g id="pbd-target">
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1" />
        </g>
        <g id="pbd-pulse">
          <path d="M2 12h4l2.5-6 4 12 3-8 2 2H22" />
        </g>
        <g id="pbd-badge">
          <circle cx="12" cy="9" r="5.5" />
          <path d="m8.5 13.5-1.5 7 5-2.6 5 2.6-1.5-7" />
        </g>
        <pattern id="portrait-backdrop" width="1400" height="1400" patternUnits="userSpaceOnUse">
          {BACKDROP_ICONS.map(({ id, x, y, scale, weight, flip, color, opacity }) => (
            <g
              key={`${id}-${x}-${y}`}
              transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
              fill="none"
              stroke={color}
              strokeWidth={weight / scale}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            >
              <use href={`#${id}`} />
            </g>
          ))}
          {BACKDROP_DOTS.map(({ x, y, r, color, opacity }) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={color} opacity={opacity} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#portrait-backdrop)" />
    </svg>
  );
}

function PortraitReport({ report, reportRef }: { report: StudentPortraitData; reportRef?: Ref<HTMLDivElement> }) {
  const ranked = dimensions
    .map((name, index) => ({ name, score: report.scores[index] }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  const strongest = ranked[0];
  const practice = ranked.filter(({ score }) => score < 60).map(({ name }) => name);
  const metrics = [
    { icon: ClipboardList, label: "已通过任务", number: report.passedCount, unit: "项" },
    { icon: Layers3, label: "已完成场景", number: report.completedCount, unit: "个" },
    { icon: GraduationCap, label: "最新理论测评", number: report.latestExam?.score, unit: "分", empty: "待测评" },
    { icon: Award, label: "已获凭证", number: report.certificates.length, unit: "张" },
  ];
  const details = [report.className, report.education, report.studentNo && `学号 ${report.studentNo}`].filter(Boolean);
  return (
    <div className="ep-student-report" ref={reportRef}>
      <header className="ep-student-report-identity">
        <div className="ep-student-report-person">
          <div className="ep-student-report-avatar" aria-hidden="true">{report.name.slice(0, 1)}</div>
          <div>
            <p className="ep-student-report-brand">科来网络 · 学生能力画像</p>
            <div className="ep-student-report-name">
              <h2>{report.name}</h2>
              {report.status && <span>{report.status}</span>}
            </div>
            {details.length > 0 && <p className="ep-student-report-meta">{details.join("　·　")}</p>}
          </div>
        </div>
        <div className="ep-student-report-score">
          <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
            <circle cx="52" cy="52" r="47" fill="none" stroke="#b7cff1" strokeWidth="4.5" />
            {report.overall !== null && (
              <circle cx="52" cy="52" r="47" fill="none" stroke="#1f6ae0" strokeWidth="4.5" strokeLinecap="round" pathLength="100" strokeDasharray={`${report.overall} 100`} transform="rotate(-90 52 52)" />
            )}
          </svg>
          <strong>{report.overall ?? "—"}</strong>
          <span>综合能力分</span>
        </div>
      </header>

      <dl className="ep-student-report-metrics">
        {metrics.map(({ icon: Icon, label, number, unit, empty }) => (
          <div key={label}>
            <dt>{label}<Icon size={20} aria-hidden="true" /></dt>
            <dd>{number ?? empty}{number !== undefined && <small>{unit}</small>}</dd>
          </div>
        ))}
      </dl>

      <section className="ep-student-report-card ep-student-report-capability">
        <div className="ep-student-report-chart">
          <h3><Radar size={19} aria-hidden="true" />六维能力</h3>
          <PortraitRadar values={report.scores} benchmark={report.benchmark} />
          <div className="ep-student-report-legend">
            <span>个人能力</span>
            {report.benchmark && <span>班级均值</span>}
          </div>
        </div>
        <div className="ep-student-report-breakdown">
          <h3><ScanLine size={19} aria-hidden="true" />能力明细</h3>
          <dl className="ep-student-report-dimensions">
            {dimensions.map((dimension, index) => {
              const score = report.scores[index];
              return (
                <div key={dimension}>
                  <dt>{dimension}</dt>
                  <dd>
                    <Meter value={score} />
                    <strong>{score || "—"}</strong>
                  </dd>
                </div>
              );
            })}
          </dl>
          {strongest && (
            <div className="ep-student-report-insight">
              <TrendingUp size={17} aria-hidden="true" />
              <span>优势维度 <b>{strongest.name}</b></span>
              {practice.length > 0 && <span>待提升 <b>{practice.join("、")}</b></span>}
            </div>
          )}
        </div>
      </section>

      <div className="ep-student-report-practice">
        <section className="ep-student-report-card ep-student-report-jobs">
          <h3><BriefcaseBusiness size={19} aria-hidden="true" />岗位契合度</h3>
          {report.matches.length === 0 ? <p className="ep-student-report-empty">暂无匹配结果</p> : (
            <ol>
              {report.matches.map((match) => (
                <li key={match.id}>
                  <div><Link href={`/platform/job/${match.id}`}>{match.name}</Link><strong>{match.match}%</strong></div>
                  <Meter value={match.match} />
                  <small>{match.missing.length ? `待补强：${match.missing.join("、")}` : "关键能力已达标"}</small>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="ep-student-report-card ep-student-report-scenes">
          <h3><Layers3 size={19} aria-hidden="true" />场景实训</h3>
          {report.scenes.length === 0 ? <p className="ep-student-report-empty">暂无实训记录</p> : (
            <ul>
              {report.scenes.map((scene) => (
                <li key={scene.id}>
                  <span className="ep-student-report-scene-icon"><Layers3 size={17} aria-hidden="true" /></span>
                  <div>
                    <strong>{scene.name}</strong>
                    {scene.total > 0 && <small>必做任务 {scene.done} / {scene.total}{scene.status === "已完成" && scene.score !== undefined ? ` · ${scene.score} 分` : ""}</small>}
                  </div>
                  <span className="ep-student-report-status" data-completed={scene.status === "已完成"}>{scene.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="ep-student-report-card ep-student-report-evidence">
        <h3><ClipboardList size={19} aria-hidden="true" />近期实训成果</h3>
        {report.evidence.length === 0 ? <p className="ep-student-report-empty">暂无可展示的任务成果</p> : (
          <ol>
            {report.evidence.slice(0, 6).map((evidence) => (
              <li key={evidence.id}>
                <span className="ep-student-report-scene-icon"><BadgeCheck size={18} aria-hidden="true" /></span>
                <div><strong>{evidence.title}</strong><small>{evidence.scene} · {evidence.date.slice(0, 10)}</small></div>
                {evidence.comment && <p>{evidence.comment}</p>}
                {evidence.score !== undefined && <span className="ep-student-report-evidence-score"><strong>{evidence.score}</strong> 分</span>}
              </li>
            ))}
          </ol>
        )}
      </section>

      {(report.latestExam || report.certificates.length > 0) && (
        <section className="ep-student-report-card ep-student-report-scenes">
          <h3><Award size={19} aria-hidden="true" />测评与凭证</h3>
          <ul>
            {report.latestExam && (
              <li>
                <span className="ep-student-report-scene-icon"><GraduationCap size={18} aria-hidden="true" /></span>
                <div><strong>{report.latestExam.assessmentName ?? "理论测评"}</strong><small>{report.latestExam.submittedAt.slice(0, 10)} · {report.latestExam.score} 分</small></div>
                <span className="ep-student-report-status" data-completed={report.latestExam.passed}>{report.latestExam.passed ? "已通过" : "未通过"}</span>
              </li>
            )}
            {report.certificates.map((item) => (
              <li key={item.id}>
                <span className="ep-student-report-scene-icon"><Award size={18} aria-hidden="true" /></span>
                <div><strong>{item.number}</strong><small>结业凭证 · {item.issuedAt.slice(0, 10)}</small></div>
                <span className="ep-student-report-status" data-completed="true">已获得</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer className="ep-student-report-footer">科来网络 · 场景化产教融合平台</footer>
    </div>
  );
}

function Meter({ value }: { value: number }) {
  return <span className="ep-student-report-meter" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></span>;
}

function PortraitRadar({ values, benchmark }: { values: number[]; benchmark?: number[] }) {
  const gradient = useId();
  const point = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
    return { x: 220 + Math.cos(angle) * value * 1.08, y: 145 + Math.sin(angle) * value * 1.08 };
  };
  const polygon = (series: number[]) => dimensions.map((_, index) => {
    const { x, y } = point(index, series[index] ?? 0);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 440 290" className="ep-student-report-radar" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x2="1" y2="1">
          <stop stopColor="#397afa" stopOpacity=".33" />
          <stop offset="1" stopColor="#3eb5e9" stopOpacity=".14" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80, 100].map((scale) => <polygon key={scale} points={polygon(dimensions.map(() => scale))} fill="none" stroke={scale === 100 ? "#c6d6ee" : "#e0e9f7"} />)}
      {dimensions.map((name, index) => {
        const axis = point(index, 100);
        const label = point(index, 119);
        return (
          <g key={name}>
            <line x1="220" y1="145" x2={axis.x} y2={axis.y} stroke="#e0e9f7" />
            <text x={label.x} y={label.y} textAnchor={index % 3 === 0 ? "middle" : index < 3 ? "start" : "end"} dominantBaseline="central" fill="#314969" fontSize="14">{name}</text>
          </g>
        );
      })}
      {benchmark && <polygon points={polygon(benchmark)} fill="none" stroke="#6d86b0" strokeWidth="1.8" strokeDasharray="5 5" />}
      {values.some((value) => value > 0) && (
        <>
          <polygon points={polygon(values)} fill={`url(#${gradient})`} stroke="#2e67e4" strokeWidth="2" />
          {values.map((value, index) => {
            const { x, y } = point(index, value);
            return value > 0 && <circle key={dimensions[index]} cx={x} cy={y} r="3.8" fill="#fff" stroke="#2e67e4" strokeWidth="2" />;
          })}
        </>
      )}
    </svg>
  );
}
