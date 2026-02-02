import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { FormEditor } from '@/components/form-builder/FormEditor';
import { PublicForm } from '@/pages/PublicForm';
import { FormResponses } from '@/pages/FormResponses';
import { Toaster } from '@/components/ui/sonner';
import type { Form } from '@/types/form';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

// Separated into a child component so we can use hooks like useLocation
function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {/* We pass 'location' and 'key' to Routes so Framer Motion 
        detects when the route changes to trigger exit animations 
      */}
      <Routes location={location} key={location.pathname}>
        
        {/* === LANDING PAGE === */}
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <LandingPage onGetStarted={() => navigate('/dashboard')} />
            </motion.div>
          }
        />

        {/* === DASHBOARD === */}
        <Route
          path="/dashboard"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Dashboard
                onEditForm={(form) =>
                  // We pass the form object in 'state' so we don't have to refetch it immediately
                  navigate(`/editor/${form.id}`, { state: { form } })
                }
              />
            </motion.div>
          }
        />

        {/* === EDITOR === */}
        <Route
          path="/editor/:formId"
          element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Wrapper handles extracting form data from router state */}
              <EditorWrapper onBack={() => navigate('/dashboard')} />
            </motion.div>
          }
        />

        {/* === PUBLIC FORM === */}
        <Route path="/form/:formId" element={<PublicForm />} />

        {/* === RESPONSES === */}
        <Route path="/form/:id/responses" element={<FormResponses />} />

        {/* === FALLBACK === */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
}

// Helper component to handle the Form prop safely
function EditorWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const form = location.state?.form as Form | undefined;

  // NOTE: If user refreshes the page on /editor/123, 'state' will be lost.
  // In a real app, you would use useParams() here to fetch the form by ID.
  // For now, we redirect to dashboard if form data is missing.
  if (!form) {
    return <Navigate to="/dashboard" replace />;
  }

  return <FormEditor form={form} onBack={onBack} />;
}

export default App;