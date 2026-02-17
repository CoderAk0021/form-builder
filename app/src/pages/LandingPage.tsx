import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/auth";
import gsap from "gsap";

const features = [
  {
    title: "Fast Form Builder",
    description: "Build forms in minutes with multiple questions.",
    icon: Zap,
  },
  {
    title: "Live Preview",
    description:
      "Switch between editor and preview instantly on desktop and mobile.",
    icon: Sparkles,
  },
  {
    title: "Response Ready",
    description:
      "Publish quickly and track responses in one focused workspace.",
    icon: FileText,
  },
];

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-gsap='hero']",
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-gsap='feature-card']",
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          ease: "power2.out",
          delay: 0.15,
          stagger: 0.08,
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const handleSignIn = async () => {
    if (isCheckingSession) return;

    setIsCheckingSession(true);
    try {
      const hasValidSession = await refreshSession();
      navigate(hasValidSession ? "/dashboard" : "/login");
    } finally {
      setIsCheckingSession(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_40%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-14 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 backdrop-blur">
            <Logo size={16} />
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-400">
              Easy Forms
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleSignIn();
            }}
            disabled={isCheckingSession}
            className="inline-flex h-9 items-center rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            {isCheckingSession ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </header>

        <main className="grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section data-gsap="hero">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Smart form workflows for teams
            </p>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Build polished forms and ship them in minutes.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Easy Forms gives you a focused builder, live preview, and clean
              response flow with the same look and feel you already use in your
              app.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-100 px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/editor"
                className="inline-flex h-11 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
              >
                Open Builder
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Platform Highlights
              </h2>
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
            </div>

            <div className="space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    data-gsap="feature-card"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-zinc-700"
                  >
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
                      <Icon className="h-4 w-4 text-zinc-300" />
                    </div>
                    <p className="text-sm font-medium text-zinc-100">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
