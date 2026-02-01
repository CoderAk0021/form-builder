import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { FormEditor } from '@/components/form-builder/FormEditor';
import { PublicForm } from '@/pages/PublicForm';
import { Toaster } from '@/components/ui/sonner';
import type { Form } from '@/types/form';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'editor'>('landing');
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  const handleGetStarted = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  const handleEditForm = useCallback((form: Form) => {
    setEditingForm(form);
    setCurrentView('editor');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setEditingForm(null);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard onEditForm={handleEditForm} />
          </motion.div>
        )}

        {currentView === 'editor' && editingForm && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormEditor
              form={editingForm}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-right" richColors />
    </>
  );
}

// Router wrapper for public form access
function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/form/:formId" element={<PublicForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default AppWithRouter;
