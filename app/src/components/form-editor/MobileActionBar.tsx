import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuestionTypesPanel } from "@/components/form-editor/QuestionTypesPanel";
import { SettingsContent } from "./SettingsContent";
import type { Form, QuestionType } from "@/types/form";

interface MobileActionBarProps {
  form: Form;
  isTestUser: boolean;
  onAddQuestion: (type: QuestionType) => void;
  onUpdateSettings: (updates: Partial<Form["settings"]>) => void;
  onUploadThemeAsset: (
    target: "logoUrl" | "bannerUrl",
    file: File,
  ) => Promise<void>;
  isThemeAssetUploading: boolean;
}

export const MobileActionBar = ({
  form,
  isTestUser,
  onAddQuestion,
  onUpdateSettings,
  onUploadThemeAsset,
  isThemeAssetUploading,
}: MobileActionBarProps) => {
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  return (
    <div className="lg:hidden grid grid-cols-2 gap-3 mb-2 sticky top-0 z-20 pb-2">
      <Sheet open={showMobileAdd} onOpenChange={setShowMobileAdd}>
        <SheetTrigger asChild>
          <Button className="w-full bg-zinc-100 text-gray-900 hover:bg-zinc-200 shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[70vh] bg-zinc-950 border-white/10 p-0 rounded-t-2xl flex flex-col"
        >
          <div className="p-3 flex flex-col h-full">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="text-white">
                Select Question Type
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <QuestionTypesPanel
                disabledTypes={isTestUser ? ["file_upload"] : []}
                disabledReason="Test users cannot use file upload fields"
                onAddQuestion={(type) => {
                  onAddQuestion(type);
                  setShowMobileAdd(false);
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showMobileSettings} onOpenChange={setShowMobileSettings}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full bg-zinc-900 border-white/10 text-white hover:bg-zinc-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="w-[70%] px-5 pb-5 sm:w-[400px] bg-zinc-950 border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Form Settings
            </SheetTitle>
          </SheetHeader>

          <div className="overflow-auto">
            <SettingsContent
              form={form}
              isTestUser={isTestUser}
              onUpdateSettings={onUpdateSettings}
              onUploadThemeAsset={onUploadThemeAsset}
              isThemeAssetUploading={isThemeAssetUploading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
