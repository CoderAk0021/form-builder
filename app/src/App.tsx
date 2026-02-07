import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { FormEditor } from '@/components/form-builder/FormEditor';
import { PublicForm } from '@/pages/PublicForm';
import { FormResponses } from '@/pages/FormResponses';
import { Toaster } from '@/components/ui/sonner';
import type { Form } from '@/types/form';
import { ReactNode } from 'react';

// 1. Reusable transition wrapper to keep code clean and behavior consistent
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} // Subtle lift effect
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeInOut" }} // Faster duration feels snappier
    className="w-full min-h-screen" // Ensure it takes full height
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <BrowserRouter>
      {/* 2. Global Background: Prevents white flash during React render cycles */}
      <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-indigo-500/30">
        <AppRoutes />
        <Toaster position="top-right" richColors theme="dark" />
      </div>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    // 3. mode="popLayout": Allows pages to overlap during transition
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        
        {/* === LANDING PAGE === */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage onGetStarted={() => navigate('/dashboard')} />
            </PageTransition>
          }
        />

        {/* === DASHBOARD === */}
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

        {/* === EDITOR === */}
        <Route
          path="/editor/:formId"
          element={
            <PageTransition>
              <EditorWrapper onBack={() => navigate('/dashboard')} />
            </PageTransition>
          }
        />

        {/* === PUBLIC FORM === */}
        <Route 
          path="/form/:formId" 
          element={
            // Optional: You might want a different transition for public forms
            <PageTransition>
              <PublicForm />
            </PageTransition>
          } 
        />

        {/* === RESPONSES === */}
        <Route 
          path="/form/:id/responses" 
          element={
            <PageTransition>
              <FormResponses />
            </PageTransition>
          } 
        />

        {/* === FALLBACK === */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
}

function EditorWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const form = location.state?.form as Form | undefined;

  if (!form) {
    return <Navigate to="/dashboard" replace />;
  }

  return <FormEditor form={form} onBack={onBack} />;
}

export default App;