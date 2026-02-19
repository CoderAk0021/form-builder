# Security Policy

## Reporting a Vulnerability

The EasyForms team takes security seriously.  
If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead, report it privately using one of the following methods:

Email: **istebitsbh01@gmail.com**  


Please include:

- A detailed description of the vulnerability  
- Steps to reproduce the issue  
- Proof-of-concept (if possible)  
- Impact assessment (data leak, auth bypass, RCE, etc.)  

We will respond as soon as possible and work on a fix.

---

##  Supported Versions

We actively maintain the latest stable release.

| Version | Supported |
|---------|-----------|
| v2.x.x  |  Supported |
| v1.x.x  |  Limited support |
| < v1.0  |  Not supported |

---

##  Responsible Disclosure

We follow a **responsible disclosure policy**:

1. Security issues should be reported privately.
2. Maintainers will confirm the vulnerability within **7 days**.
3. A fix will be developed and released as soon as possible.
4. Public disclosure will occur **after a patch is available**.

---

##  Security Researcher Recognition

We value security researchers and contributors.  
If you responsibly disclose a vulnerability, you will be acknowledged in the project (if you wish).

---

##  Security Best Practices for Contributors

Contributors must ensure:

- No secrets (API keys, passwords, tokens) are committed to the repository
- Environment variables are stored in `.env` files (never committed)
- Dependencies are kept updated
- User input is validated and sanitized
- File uploads are securely handled
- Authentication and authorization logic is reviewed carefully

---

##  Scope

This security policy applies to:

- Backend API (Node.js / Express)
- Frontend application (React / Vite)
- Deployment infrastructure (Vercel, Render, Cloudinary)
- Third-party integrations (Google OAuth, Email services)

---

##  Acknowledgements

We thank the open-source community and security researchers for helping keep EasyForms safe.

---

By reporting security issues responsibly, you help protect users and the community. 💙
