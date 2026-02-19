# Contributing to EasyForms 

First off all, thank you for considering contributing to **EasyForms**!  
We appreciate your time and effort to improve this open-source project.

This project is maintained under **ISTE BIT Sindri** and welcomes contributions from students, developers, and the open-source community.

---

##  How Can You Contribute?

You can contribute in many ways:

-  Reporting bugs
-  Suggesting new features
-  Improving documentation
-  Writing code (frontend/backend)
-  UI/UX improvements
-  Refactoring & performance improvements

---

## Getting Started

### 1️⃣ Fork the Repository

Click the **Fork** button on GitHub.

---

### 2️⃣ Clone Your Fork

```bash
git clone https://github.com/<your-username>/EasyForms.git
cd EasyForms
```

### 3️⃣ Create a New Branch

Follow the naming convention:
``` bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-name
```
##  Development Setup

### Backend

```bash
cd server
npm install
Create .env in /server:
```
```bash
PORT=3001
MONGODB_URI=<your-mongodb-connection-string>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLIENT_ID=<your-google-client-id>
// Mail (choose one provider mode)
// Mode A: SMTP
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
SMTP_SECURE=false
SMTP_FROM=<no-reply@your-domain.com>

// Mode B: Mailtrap API token
MAIL_TOKEN=<mailtrap-api-token>
MAIL_FROM=<sandbox@example.com-or-verified-sender>
MAIL_FROM_NAME=Form Builder
MAILTRAP_USE_SANDBOX=true
MAILTRAP_INBOX_ID=<mailtrap-inbox-id-for-sandbox>
```
```
npm run dev
```
### Frontend
```bash
cd client
npm install
```
### Create `.env` in `/client`
``` bash
VITE_API_URL=http://localhost:5000
VITE_CLIENT_ID=<your-google-client-id>
```
```
npm run dev
```
###  Commit Message Guidelines (Conventional Commits)

We follow Conventional Commits for clarity and automation.

Format
- type(scope): short description
```markdown
Examples
feat(forms): add banner upload feature
fix(ui): resolve form editor layout bug
docs(readme): update installation steps
refactor(api): optimize response controller
```
| Type       | Meaning                      |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `docs`     | Documentation                |
| `style`    | Formatting (no logic change) |
| `refactor` | Code refactoring             |
| `perf`     | Performance improvement      |
| `test`     | Tests                        |
| `chore`    | Build / tooling changes      |

###  Pull Request Workflow

Push your branch:
``` bash
git push origin feature/your-feature-name
```

- Open a Pull Request to the development branch

- Add a clear description of what you changed

- Link related issues (if any)

###  Branching Strategy
```
main        → stable production releases
development → active development
feature/*   → new features
fix/*       → bug fixes
```

###  Code Style Guidelines

- Use ESLint + Prettier (if configured)

- Write clean, readable, and modular code

- Avoid large commits—keep changes focused

- Add comments for complex logic

- Ensure no secrets are committed

###  Testing

Before submitting a PR:

- Ensure the app builds successfully

- Test form creation, submission, and admin dashboard

- Check file uploads & Google OAuth if modified

###  Security

If you find a security vulnerability:

- Do NOT open a public issue.
- Email us privately at:

- **REPORT HERE** - [security mail](mailto:istebitsbh01@gmail.com)


###  Code of Conduct

By contributing, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md)
.

###  Contributors Recognition

All contributors will be recognized automatically in the README via the GitHub contributors list.

###  Need Help?

Open an issue or contact the maintainers

Thank you for helping make EasyForms better for everyone! 💙