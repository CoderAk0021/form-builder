import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { toast } from 'sonner';
import { Shield, UserCheck } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

interface Props {
  onVerified: (token: string, displayEmail: string) => void;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleTokenPayload {
  email?: string;
}

export function GoogleVerification({ onVerified }: Props) {
  const handleSuccess = (credentialResponse: GoogleCredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = jwtDecode<GoogleTokenPayload>(credentialResponse.credential);
      if (!decoded.email) {
        toast.error("Unable to retrieve account information");
        return;
      }
      onVerified(credentialResponse.credential, decoded.email);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-500">
        Authentication unavailable. Configuration required.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950">
          <Shield className="h-5 w-5 text-zinc-300" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">
          Verify Identity
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Continue with Google to submit this form.
        </p>
        <div className="mt-4 w-full max-w-xs rounded-md border border-zinc-800 bg-zinc-950 p-2 flex items-center flex-col justify-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <UserCheck className="h-3.5 w-3.5" />
            Secure verification
          </div>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => toast.error("Authentication failed")}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
              size="large"
              width="240"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}
