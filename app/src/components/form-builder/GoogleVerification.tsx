import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { toast } from 'sonner';

// Replace with your actual Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ;

interface Props {
  onVerified: (token: string, displayEmail: string) => void;
}

export function GoogleVerification({ onVerified }: Props) {
  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      // We decode ONLY for UI purposes (to show "Welcome John")
      // The secure verification happens on the backend using the raw credential
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      // Pass the RAW token to the parent
      onVerified(credentialResponse.credential, decoded.email);
      toast.success(`Welcome, ${decoded.name}`);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl text-center space-y-4">
      <h3 className="font-medium text-gray-900">Sign in to verify identity</h3>
      <div className="flex justify-center">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Login Failed")}
            useOneTap
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}