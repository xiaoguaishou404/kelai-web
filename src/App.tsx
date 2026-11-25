import { Navigate, Route, Routes } from "react-router-dom";
import { PageAgentBootstrap } from "@/components/enterprise/page-agent-bootstrap";
import { ScrollManager } from "@/components/router/scroll-manager";
import { PlatformPage } from "@/pages/platform-page";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Navigate to="/platform/login" replace />} />
        <Route path="/platform/*" element={<PlatformPage />} />
        <Route path="/student/*" element={<Navigate to="/platform/learning" replace />} />
        <Route path="/teacher/*" element={<Navigate to="/platform/teacher" replace />} />
        <Route path="/leader/*" element={<Navigate to="/platform/teacher/report" replace />} />
        <Route path="/operator/*" element={<Navigate to="/platform/manage" replace />} />
        <Route path="*" element={<Navigate to="/platform/industry" replace />} />
      </Routes>
      <PageAgentBootstrap />
    </>
  );
}
