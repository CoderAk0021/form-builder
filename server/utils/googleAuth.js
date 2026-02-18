import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export async function verifyGoogleIdentity(token) {
  try {
    if (!googleClientId) {
      console.error("Token Verification Failed: Google client ID is not configured");
      return null;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return null;
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email).trim().toLowerCase(),
      name: typeof payload.name === "string" ? payload.name : "",
      picture:
        typeof payload.picture === "string" ? String(payload.picture) : "",
    };
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return null;
  }
}

export async function verifyGoogleToken(token) {
  try {
    const identity = await verifyGoogleIdentity(token);
    return identity?.email || null;
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return null;
  }
}

