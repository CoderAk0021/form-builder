import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "@/components/ui/Logo";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/auth";

export function TestUserSignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsTestUserWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_CLIENT_ID as string | undefined;

  const handleGoogleTestLogin = async (idToken?: string) => {
    if (!idToken) {
      toast.error("Google authentication failed");
      return;
    }

    setIsLoading(true);
    try {
      await loginAsTestUserWithGoogle(idToken);
      toast.success("Signed in as test user");
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Google sign in failed";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_45%)]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2">
            <Logo size={16} />
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-400">
              Easy Forms
            </span>
          </div>
        </div>
        <div className="my-2 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Test User Signup
          </h1>
          <p className="text-xs text-zinc-400">
            Sign up with Google to explore the utility as a test user.
          </p>
        </div>
        <div className="mt-6 space-y-3">
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div className="flex justify-center rounded-lg">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    void handleGoogleTestLogin(credentialResponse.credential);
                  }}
                  onError={() => toast.error("Google authentication failed")}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500">
              Google test signup is unavailable. Configure `VITE_CLIENT_ID`.
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={isLoading}
            className="mt-2 flex h-11 w-full items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60 underline underline-offset-2 hover:text-blue-600"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Admin Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
