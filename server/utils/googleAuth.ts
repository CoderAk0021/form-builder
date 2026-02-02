const { OAuth2Client } = require('google-auth-library');

// Use the SAME Client ID you created in Google Cloud Console
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    
    // Returns the verified email (e.g., "user@gmail.com")
    return payload.email; 
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return null;
  }
}

module.exports = { verifyGoogleToken };