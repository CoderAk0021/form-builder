import { useRef } from "react";
import {
  Eye,
  Copy,
  Image,
  Building2,
  Sparkles,
  Mail,
  CalendarClock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Form } from "@/types/form";

interface SettingsContentProps {
  form: Form;
  onUpdateSettings: (updates: Partial<Form["settings"]>) => void;
  onUploadThemeAsset: (
    target: "logoUrl" | "bannerUrl",
    file: File,
  ) => Promise<void>;
  isThemeAssetUploading: boolean;
}

const toLocalDateInputValue = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalTimeInputValue = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const toIsoFromLocalDateTime = (
  dateValue: string,
  timeValue: string,
): string | null => {
  if (!dateValue || !timeValue) return null;
  const [yearPart, monthPart, dayPart] = dateValue.split("-").map(Number);
  const [hourPart, minutePart] = timeValue.split(":").map(Number);
  if (
    !Number.isInteger(yearPart) ||
    !Number.isInteger(monthPart) ||
    !Number.isInteger(dayPart) ||
    !Number.isInteger(hourPart) ||
    !Number.isInteger(minutePart)
  ) {
    return null;
  }

  const localDateTime = new Date(
    yearPart,
    monthPart - 1,
    dayPart,
    hourPart,
    minutePart,
    0,
    0,
  );
  if (Number.isNaN(localDateTime.getTime())) return null;
  return localDateTime.toISOString();
};

export const SettingsContent = ({
  form,
  onUpdateSettings,
  onUploadThemeAsset,
  isThemeAssetUploading,
}: SettingsContentProps) => {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const bannerImageUrl =
    form.settings.theme.bannerUrl || form.settings.theme.backgroundImageUrl;
  const bannerPositionX =
    typeof form.settings.theme.bannerPositionX === "number"
      ? form.settings.theme.bannerPositionX
      : 50;
  const bannerPositionY =
    typeof form.settings.theme.bannerPositionY === "number"
      ? form.settings.theme.bannerPositionY
      : 50;
  const emailNotification = form.settings.emailNotification || {
    enabled: false,
    subject: "Your response to {{formTitle}} was received",
    message:
      'Hi {{email}},\n\nThank you for completing "{{formTitle}}". We have recorded your submission on {{submittedAt}}.',
  };
  const responseDeadlineAt = form.settings.responseDeadlineAt;
  const deadlineDateValue = toLocalDateInputValue(responseDeadlineAt);
  const deadlineTimeValue = toLocalTimeInputValue(responseDeadlineAt);
  const hasResponseDeadline = Boolean(responseDeadlineAt);
  const maxResponsesValue =
    typeof form.settings.maxResponses === "number" && form.settings.maxResponses > 0
      ? form.settings.maxResponses
      : null;
  const hasMaxResponsesLimit = maxResponsesValue !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 px-2">
              <Building2 className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <Label className="text-sm font-medium text-white">Branding</Label>
              <p className="text-xs text-zinc-500">
                Logo, hero background, and labels
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              value={form.settings.theme.brandName || ""}
              onChange={(e) =>
                onUpdateSettings({
                  theme: {
                    ...form.settings.theme,
                    brandName: e.target.value,
                  },
                })
              }
              placeholder="Brand name (optional)"
              className="text-sm md:text-md h-9 border-white/10 bg-zinc-950 text-zinc-100"
            />
            <Input
              value={form.settings.theme.brandTagline || ""}
              onChange={(e) =>
                onUpdateSettings({
                  theme: {
                    ...form.settings.theme,
                    brandTagline: e.target.value,
                  },
                })
              }
              placeholder="Brand tagline (optional)"
              className="text-sm  md:text-md h-9 border-white/10 bg-zinc-950 text-zinc-100"
            />
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isThemeAssetUploading}
                className="text-xs inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 bg-zinc-950 px-3 md:text-sm text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {form.settings.theme.logoUrl ? "Replace Logo" : "Upload Logo"}
              </button>
              <button
                type="button"
                onClick={() => backgroundInputRef.current?.click()}
                disabled={isThemeAssetUploading}
                className="text-xs inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 bg-zinc-950 px-3 md:text-sm text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Image className="h-4 w-4" />
                {form.settings.theme.bannerUrl ||
                form.settings.theme.backgroundImageUrl
                  ? "Replace Banner Image"
                  : "Upload Banner Image"}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Banner image appears at the top of the public form.
            </p>
            {bannerImageUrl && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-zinc-950/70 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-zinc-300">
                    Horizontal Position
                  </Label>
                  <span className="text-xs text-zinc-500">
                    {bannerPositionX}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={bannerPositionX}
                  onChange={(e) =>
                    onUpdateSettings({
                      theme: {
                        ...form.settings.theme,
                        bannerPositionX: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-indigo-400"
                />

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-zinc-300">
                    Vertical Position
                  </Label>
                  <span className="text-xs text-zinc-500">
                    {bannerPositionY}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={bannerPositionY}
                  onChange={(e) =>
                    onUpdateSettings({
                      theme: {
                        ...form.settings.theme,
                        bannerPositionY: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-indigo-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      theme: {
                        ...form.settings.theme,
                        bannerPositionX: 50,
                        bannerPositionY: 50,
                      },
                    })
                  }
                  className="inline-flex h-8 items-center justify-center rounded-md border border-white/15 bg-zinc-900 px-3 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Reset Banner Position
                </button>
              </div>
            )}
            {(form.settings.theme.logoUrl ||
              form.settings.theme.bannerUrl ||
              form.settings.theme.backgroundImageUrl) && (
              <div className="space-y-2">
                {form.settings.theme.logoUrl && (
                  <p className="truncate text-xs text-zinc-500">
                    Logo: {form.settings.theme.logoUrl}
                  </p>
                )}
                {(form.settings.theme.bannerUrl ||
                  form.settings.theme.backgroundImageUrl) && (
                  <p className="truncate text-xs text-zinc-500">
                    Banner:{" "}
                    {form.settings.theme.bannerUrl ||
                      form.settings.theme.backgroundImageUrl}
                  </p>
                )}
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onUploadThemeAsset("logoUrl", file);
                }
                e.target.value = "";
              }}
            />
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onUploadThemeAsset("bannerUrl", file);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 px-2">
              <Eye className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <Label
                htmlFor="progress-bar"
                className="cursor-pointer text-sm font-medium text-white"
              >
                Progress Bar
              </Label>
              <p className="text-xs text-zinc-500">Show completion progress</p>
            </div>
          </div>
          <Switch
            id="progress-bar"
            checked={form.settings.showProgressBar}
            onCheckedChange={(checked) =>
              onUpdateSettings({ showProgressBar: checked })
            }
            className="data-[state=checked]:bg-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center px-2 rounded-lg bg-indigo-500/20">
              <Copy className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <Label
                htmlFor="multiple-responses"
                className="cursor-pointer text-sm font-medium text-white"
              >
                Multiple Responses
              </Label>
              <p className="text-xs text-zinc-500">
                Allow users to submit multiple times
              </p>
            </div>
          </div>
          <Switch
            id="multiple-responses"
            checked={form.settings.allowMultipleResponses}
            onCheckedChange={(checked) =>
              onUpdateSettings({ allowMultipleResponses: checked })
            }
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-900 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 px-2">
                <CalendarClock className="h-[16px] w-[16px] text-amber-300" />
              </div>
              <div>
                <Label
                  htmlFor="response-deadline"
                  className="cursor-pointer text-sm font-medium text-white"
                >
                  Response Deadline
                </Label>
                <p className="text-xs text-zinc-500">
                  Stop submissions automatically at a date and time
                </p>
              </div>
            </div>
            <Switch
              id="response-deadline"
              checked={hasResponseDeadline}
              onCheckedChange={(checked) => {
                if (!checked) {
                  onUpdateSettings({ responseDeadlineAt: null });
                  return;
                }
                if (deadlineDateValue && deadlineTimeValue) {
                  onUpdateSettings({ responseDeadlineAt });
                  return;
                }
                const now = new Date();
                now.setMinutes(now.getMinutes() + 30);
                onUpdateSettings({ responseDeadlineAt: now.toISOString() });
              }}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {hasResponseDeadline && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                type="date"
                value={deadlineDateValue}
                onChange={(e) => {
                  const nextIso = toIsoFromLocalDateTime(
                    e.target.value,
                    deadlineTimeValue || "23:59",
                  );
                  if (!nextIso) return;
                  onUpdateSettings({ responseDeadlineAt: nextIso });
                }}
                className="h-9 border-white/10 bg-zinc-950 text-zinc-100 [color-scheme:dark]"
              />
              <Input
                type="time"
                value={deadlineTimeValue}
                onChange={(e) => {
                  const nextIso = toIsoFromLocalDateTime(
                    deadlineDateValue ||
                      toLocalDateInputValue(new Date().toISOString()),
                    e.target.value,
                  );
                  if (!nextIso) return;
                  onUpdateSettings({ responseDeadlineAt: nextIso });
                }}
                className="h-9 border-white/10 bg-zinc-950 text-zinc-100 [color-scheme:dark]"
              />
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-900 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label
                htmlFor="max-responses"
                className="cursor-pointer text-sm font-medium text-white"
              >
                Max Responses
              </Label>
              <p className="text-xs text-zinc-500">
                Auto-close after reaching a response count
              </p>
            </div>
            <Switch
              id="max-responses"
              checked={hasMaxResponsesLimit}
              onCheckedChange={(checked) =>
                onUpdateSettings({
                  maxResponses: checked ? maxResponsesValue || 100 : null,
                })
              }
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {hasMaxResponsesLimit && (
            <Input
              type="number"
              min={1}
              step={1}
              value={String(maxResponsesValue)}
              onChange={(e) => {
                const nextValue = Number(e.target.value);
                if (!Number.isInteger(nextValue) || nextValue < 1) {
                  onUpdateSettings({ maxResponses: null });
                  return;
                }
                onUpdateSettings({ maxResponses: nextValue });
              }}
              placeholder="Maximum responses"
              className="h-9 border-white/10 bg-zinc-950 text-zinc-100"
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">
          Confirmation Message
        </Label>
        <Textarea
          value={form.settings.confirmationMessage}
          onChange={(e) =>
            onUpdateSettings({ confirmationMessage: e.target.value })
          }
          placeholder="Thank you for your response!"
          className="text-sm min-h-[100px] resize-none rounded-xl border-white/10 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-white">
          Form Closed Message
        </Label>
        <Textarea
          value={form.settings.closedMessage || ""}
          onChange={(e) => onUpdateSettings({ closedMessage: e.target.value })}
          placeholder="This form is no longer accepting responses."
          className="text-sm min-h-[100px] resize-none rounded-xl border-white/10 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-zinc-900 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 px-2">
              <Mail className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <Label
                htmlFor="submission-email-receipt"
                className="cursor-pointer text-sm font-medium text-white"
              >
                Email Receipt
              </Label>
              <p className="text-xs text-zinc-500">
                Send a custom email after successful submission
              </p>
            </div>
          </div>
          <Switch
            id="submission-email-receipt"
            checked={emailNotification.enabled}
            onCheckedChange={(checked) =>
              onUpdateSettings({
                emailNotification: {
                  ...emailNotification,
                  enabled: checked,
                },
              })
            }
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {emailNotification.enabled && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            <Input
              value={emailNotification.subject}
              onChange={(e) =>
                onUpdateSettings({
                  emailNotification: {
                    ...emailNotification,
                    subject: e.target.value,
                  },
                })
              }
              placeholder="Email subject"
              className="text-xs md:text-md h-9 border-white/10 bg-zinc-950 text-zinc-100"
            />
            <Textarea
              value={emailNotification.message}
              onChange={(e) =>
                onUpdateSettings({
                  emailNotification: {
                    ...emailNotification,
                    message: e.target.value,
                  },
                })
              }
              placeholder="Email message"
              className="text-xs md:text-md min-h-[120px] resize-none rounded-xl border-white/10 bg-zinc-950 text-white placeholder:text-zinc-600"
            />
            <p className="text-xs md:text-md text-zinc-500">
              Variables: {"{{email}}"}, {"{{formTitle}}"}, {"{{submittedAt}}"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
