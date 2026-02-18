import { useLocation,useNavigate,Route,Routes,Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { PublicForm } from "@/pages/PublicForm";
import { Dashboard } from "@/pages/Dashboard";
import { LandingPage } from "@/pages/LandingPage";
import { TestUserSignupPage } from "@/pages/TestUserSignupPage";
import ProtectedRoute from "./ProtectedRoute";
import { FormResponses } from "@/pages/FormResponses";
import EditorWrapper from "./EditorWrapper";
import ProtectedAppShell from "./ProtectedAppShell";
import { EditorFormsPage, ResponsesFormsPage } from "@/pages/FormCollections";

export default function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Routes location={location} key={location.pathname}>
        
        {/* === PUBLIC ROUTES === */}

        {/* 0. Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 1. Login Page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test-signup" element={<TestUserSignupPage />} />

        {/* 2. Public Form View (Must be public so respondents can access) */}
        <Route path="/form/:formId" element={<PublicForm />} />

        <Route path="/form" element={<PublicForm />} />

        {/* === PROTECTED ROUTES === */}
        {/* All routes inside this wrapper require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedAppShell />}>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  onEditForm={(form) =>
                    navigate(`/editor/${form.id}${location.search || ""}`, { state: { form } })
                  }
                />
              }
            />

            <Route
              path="/editor"
              element={<EditorFormsPage />}
            />

            <Route
              path="/editor/:formId"
              element={
                <EditorWrapper onBack={() => navigate(`/editor${location.search || ""}`)} />
              }
            />

            <Route path="/responses" element={<ResponsesFormsPage />} />

            <Route 
              path="/form/:id/responses" 
              element={<FormResponses />} 
            />
          </Route>
           
           {/* Fallback: Send to dashboard (which will redirect to login if needed) */}
           <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

      </Routes>
  );
}
