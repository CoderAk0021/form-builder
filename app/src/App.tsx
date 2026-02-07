import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dashboard } from '@/pages/Dashboard';
import { FormEditor } from '@/components/form-builder/FormEditor';
import { PublicForm } from '@/pages/PublicForm';
import { FormResponses } from '@/pages/FormResponses';
import { LoginPage } from '@/pages/LoginPage'; // Ensure this page exists
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext'; // Import from Step 3
import ProtectedRoute from '@/components/ProtectedRoute'; // Import from Step 4
import type { Form } from '@/types/form';
import type { ReactNode } from 'react';

// 1. Reusable transition wrapper
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <BrowserRouter>
      {/* 2. AuthProvider wraps the UI so context is available everywhere */}
      <AuthProvider>
        <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-indigo-500/30">
          <AppRoutes />
          <Toaster position="top-right" richColors theme="dark" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="popLayout">
      {/* Key triggers re-render on route change for animations */}
      <Routes location={location} key={location.pathname}>
        
        {/* === PUBLIC ROUTES === */}
        
        {/* 1. Login Page */}
        <Route 
          path="/login" 
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          } 
        />

        {/* 2. Public Form View (Must be public so respondents can access) */}
        <Route 
          path="/form/:formId" 
          element={
            <PageTransition>
              <PublicForm />
            </PageTransition>
          } 
        />

        {/* === PROTECTED ROUTES === */}
        {/* All routes inside this wrapper require authentication */}
        <Route element={<ProtectedRoute />}>
          
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard
                  onEditForm={(form) =>
                    navigate(`/editor/${form.id}`, { state: { form } })
                  }
                />
              </PageTransition>
            }
          />

          <Route
            path="/editor/:formId"
            element={
              <PageTransition>
                <EditorWrapper onBack={() => navigate('/dashboard')} />
              </PageTransition>
            }
          />

          <Route 
            path="/form/:id/responses" 
            element={
              <PageTransition>
                <FormResponses />
              </PageTransition>
            } 
          />
           
           {/* Fallback: Send to dashboard (which will redirect to login if needed) */}
           <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

      </Routes>
    </AnimatePresence>
  );
}

function EditorWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const form = location.state?.form as Form | undefined;

  // If someone tries to deep link to /editor without state, send them back
  if (!form) {
    return <Navigate to="/dashboard" replace />;
  }

  return <FormEditor form={form} onBack={onBack} />;
}

export default App;