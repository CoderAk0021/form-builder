export interface AuthUser {
  sub: string;
  role: "admin" | "test_user" | string;
  testUserId?: string;
  email?: string;
  name?: string;
  picture?: string;
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

export interface TestUserActivity {
  _id?: string;
  testUserId: string;
  email: string;
  action: string;
  formId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
