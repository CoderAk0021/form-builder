import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmittedStateProps {
  confirmationMessage?: string;
}

export function SubmittedState({ confirmationMessage }: SubmittedStateProps) {
  return (
    <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-800 bg-emerald-900/30">
        <CheckCircle2 className="h-7 w-7 text-emerald-300" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">
        {confirmationMessage || "Submission Received"}
      </h3>
      <p className="mt-2 text-sm text-zinc-400">
        Your response has been securely recorded.
      </p>
    </div>
  );
}

interface AlreadyRespondedStateProps {
  displayEmail: string | null;
  onSwitchAccount: () => void;
}

export function AlreadyRespondedState({
  displayEmail,
  onSwitchAccount,
}: AlreadyRespondedStateProps) {
  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-800 bg-red-950/30">
        <AlertCircle className="h-7 w-7 text-red-300" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">Response Limit Reached</h3>
      <p className="mt-2 text-sm text-zinc-400">
        A response already exists for{" "}
        <span className="text-zinc-200">{displayEmail || "this account"}</span>.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onSwitchAccount}
        className="mt-4 border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-800"
      >
        Switch Google Account
      </Button>
    </div>
  );
}
