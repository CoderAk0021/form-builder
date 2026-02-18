import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showTemplates: boolean;
  onShowTemplatesChange: (open: boolean) => void;
  onCreateBlankForm: () => Promise<void>;
  onCreateFromTemplate: (name: string) => Promise<void>;
  disableCreate?: boolean;
}

const templateOptions: Array<{
  name: string;
  description: string;
  details: string;
}> = [
  {
    name: "Event Registration",
    description: "Events, workshops, webinars",
    details: "Collect attendee and ticket details",
  },
  {
    name: "Customer Feedback",
    description: "NPS and service quality surveys",
    details: "Measure customer satisfaction quickly",
  },
  {
    name: "Job Application",
    description: "Collect candidate submissions",
    details: "Capture profile details and CV upload",
  },
];

export function DashboardHeader({
  searchQuery,
  onSearchQueryChange,
  showTemplates,
  onShowTemplatesChange,
  onCreateBlankForm,
  onCreateFromTemplate,
  disableCreate = false,
}: DashboardHeaderProps) {
  return (
    <header className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search forms..."
            className="h-9 rounded-md border-zinc-700 bg-zinc-950 pl-9 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <Dialog open={showTemplates} onOpenChange={onShowTemplatesChange}>
          <DialogTrigger asChild>
            <Button
              disabled={disableCreate}
              className="h-9 rounded-md bg-zinc-100 px-3 text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              New Form
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-700 bg-[#0a0a0a] text-zinc-100 sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create form</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Start from scratch or use a ready template.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => {
                  void onCreateBlankForm();
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-left hover:border-zinc-600"
              >
                <p className="text-sm font-medium text-zinc-100">Blank Form</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Build your own question set.
                </p>
              </button>
              {templateOptions.map((template) => (
                <button
                  key={template.name}
                  onClick={() => {
                    void onCreateFromTemplate(template.name);
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-left hover:border-zinc-600"
                >
                  <p className="text-sm font-medium text-zinc-100">
                    {template.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {template.description}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {template.details}
                  </p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
