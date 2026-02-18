import {
  formHeaderMarkdownSource,
  renderMarkdownPreview,
} from "@/lib/form-header-markdown";
import type { Form } from "@/types/form";
import type { FormPage } from "./types";

interface PreviewHeaderProps {
  form: Form;
  activePageIndex: number;
  pages: FormPage[];
  bannerImageUrl?: string;
  bannerPositionX: number;
  bannerPositionY: number;
  bannerHeightClass: string;
  headerPaddingClass: string;
}

export function PreviewHeader({
  form,
  activePageIndex,
  pages,
  bannerImageUrl,
  bannerPositionX,
  bannerPositionY,
  bannerHeightClass,
  headerPaddingClass,
}: PreviewHeaderProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      {bannerImageUrl && (
        <div className={bannerHeightClass}>
          <img
            src={bannerImageUrl}
            alt="Form banner"
            className="h-full w-full object-cover"
            style={{ objectPosition: `${bannerPositionX}% ${bannerPositionY}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-[#060b14]/30 to-transparent" />
        </div>
      )}
      <div className={headerPaddingClass}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {form.settings.theme.logoUrl && (
              <img
                src={form.settings.theme.logoUrl}
                alt="Brand logo"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-700"
              />
            )}
            <div>
              {(form.settings.theme.brandName || form.settings.theme.brandTagline) && (
                <>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                    {form.settings.theme.brandName || "Brand"}
                  </p>
                  {form.settings.theme.brandTagline && (
                    <p className="text-xs text-zinc-400">
                      {form.settings.theme.brandTagline}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
            Page {activePageIndex + 1} of {Math.max(pages.length, 1)}
          </div>
        </div>
        {pages.length > 1 && (
          <div className="mb-5 overflow-x-auto pb-1">
            <div className="flex min-w-max items-center gap-2">
              {pages.map((page, index) => (
                <div key={page.id} className="flex items-center gap-2">
                  <div
                    className={`group relative flex min-w-[140px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                      index === activePageIndex
                        ? "border-zinc-300/40 bg-gradient-to-br from-zinc-100/10 to-zinc-600/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        : index < activePageIndex
                          ? "border-emerald-700/40 bg-emerald-950/20"
                          : "border-zinc-800 bg-zinc-900/40"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        index === activePageIndex
                          ? "bg-zinc-100 text-zinc-900"
                          : index < activePageIndex
                            ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/40"
                            : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[10px] uppercase tracking-[0.14em] ${
                          index === activePageIndex
                            ? "text-zinc-300"
                            : index < activePageIndex
                              ? "text-emerald-300/80"
                              : "text-zinc-500"
                        }`}
                      >
                        Step {index + 1}
                      </p>
                      <p
                        className={`truncate text-xs ${
                          index === activePageIndex
                            ? "text-zinc-100"
                            : index < activePageIndex
                              ? "text-emerald-200"
                              : "text-zinc-400"
                        }`}
                      >
                        {page.title || "Untitled section"}
                      </p>
                    </div>
                  </div>
                  {index < pages.length - 1 && (
                    <div className="h-px w-5 shrink-0 bg-zinc-700/70" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          className="space-y-3 leading-relaxed text-zinc-200"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownPreview(
              formHeaderMarkdownSource(
                form.title,
                form.description,
                "Add a description to help respondents understand the purpose of this form...",
              ),
            ),
          }}
        />
      </div>
    </div>
  );
}
