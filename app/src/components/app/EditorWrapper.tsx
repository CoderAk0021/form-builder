import { useEffect, useState } from "react";
import { Navigate,useLocation, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { FormEditor } from "../form-builder/FormEditor";
import type { Form } from "@/types/form";
import { formsApi } from "@/api";

export default function EditorWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const { formId } = useParams<{ formId: string }>();
  const stateForm = location.state?.form as Form | undefined;
  const [form, setForm] = useState<Form | null>(stateForm ?? null);
  const [loading, setLoading] = useState(!stateForm);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      if (stateForm || !formId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await formsApi.getByIdAdmin(formId);
        setForm(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchForm();
  }, [formId, stateForm]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader className="h-4 w-4 animate-spin" />
          Loading editor
        </div>
      </div>
    );
  }

  if (notFound || !form) {
    return <Navigate to="/editor" replace />;
  }

  return <FormEditor form={form} onBack={onBack} />;
}
