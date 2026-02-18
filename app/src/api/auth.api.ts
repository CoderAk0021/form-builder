import { apiRequest } from "./client";
import type { AuthLoginResponse, AuthVerifyResponse } from "./types";

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest<AuthLoginResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  loginAsTestUserWithGoogle: async (idToken: string) => {
    return apiRequest<AuthLoginResponse>("/auth/test/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  verify: async () => {
    return apiRequest<AuthVerifyResponse>("/auth/verify");
  },

  logout: async () => {
    return apiRequest<AuthLoginResponse>("/auth/logout", {
      method: "POST",
    });
  },
};
