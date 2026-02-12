import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

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
      <div className="border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
        Authentication unavailable. Configuration required.
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 p-6 md:p-8 text-center rounded-md">
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center rounded-full">
          <Shield className="w-5 h-5 text-zinc-400" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-zinc-300 text-sm font-medium tracking-tight">
            Verify Identity to Continue
          </h3>
        </div>

        {/* Google Button Wrapper */}
        <div className="mt-2 p-1 border border-zinc-800 bg-zinc-950 rounded-md">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => toast.error("Authentication failed")}
              theme="filled_black" 
              shape="rectangular"
              text="continue_with"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}