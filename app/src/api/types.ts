export interface AuthUser {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthLoginResponse {
  success: boolean;
  message?: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export interface MailStatusResponse {
  configured: boolean;
  provider: "smtp" | "mailtrap" | null;
  senderEmail: string | null;
  missing: {
    senderEmail: boolean;
    smtpConfig: boolean;
    mailtrapToken: boolean;
  };
}
