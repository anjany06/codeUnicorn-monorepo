# 🦄 CodeUnicorn

![CodeUnicorn Hero](./front-page-2.png)

**CodeUnicorn is an intelligent GitHub Intelligence Platform that enhances your engineering workflows by combining automated PR reviews, codebase understanding, and developer analytics into one unified tool.**

It serves as a smart AI companion for developers, helping teams review code faster, understand projects better, and track engineering growth over time.

---

## 🚀 Key Features

- **🧠 Intelligent PR Reviews (RAG-Powered):** Context-aware automated pull request reviews that actually understand your codebase using **Retrieval-Augmented Generation (RAG)**. Catch issues, enforce standards, and suggest improvements.
- **📊 Developer Insights Dashboard:** Track developer activity, growth, commits, PRs, and AI reviews. Visualize work with customizable contribution graphs and discover insights like streaks and monthly trends.
- **💬 Codebase Chat System (RAG-Powered):** Ask questions about your repository and get context-aware answers instantly based on the indexed codebase and vector embeddings.
- **⚡ AI-Powered Issue Analysis (RAG-Powered):** Automatically analyze GitHub issues to suggest relevant files for fixes and apply appropriate labels based on historical context.
- **📚 AI Documentation Generation (RAG-Powered):** Effortlessly generate READMEs, onboarding guides, and system design documents built dynamically from your actual codebase structure.
- **⚙️ Deep Customization:** Control how AI reviews your code by configuring focus areas, ignore paths, and custom review rules.

![Dashboard Preview 1](./dashboard-pat1-1.png)
![Dashboard Preview 2](./dashboard-part-2.png)

---

## 🏗️ Project Structure

CodeUnicorn is maintained as a **Turborepo** monorepo, cleanly separating the frontend, backend API, and shared logic.

```
codeunicorn-monorepo/
├── apps/
│   ├── api/                 # Express backend server (Handles GitHub webhooks, database, orchestrates AI agents)
│   └── web/                 # Next.js App Router frontend (Dashboard, settings, analytics UI)
├── packages/
│   ├── ai/                  # AI logic using Vercel AI SDK, Google Generative AI, Pinecone (Vector RAG logic)
│   ├── database/            # Prisma ORM, PostgreSQL schema, and database connection utilities
│   ├── github/              # GitHub App integrations, webhooks, and Octokit logic
│   ├── inngest/             # Background job definitions (PR reviews, repository indexing, sync tasks)
│   ├── types/               # Shared TS interfaces and Zod validation schemas
│   ├── ui/                  # Shared React components (Tailwind + Radix UI)
│   ├── config/              # Shared Turborepo, Next.js configuration
│   ├── eslint-config/       # Shared ESLint rules
│   └── typescript-config/   # Shared tsconfig.json extensions
└── k8s/                     # Kubernetes manifests for production deployment
```

---

## 🛠️ Architecture & Tech Stack

### Application Layer
- **Frontend (`apps/web`):** [Next.js](https://nextjs.org/) (App Router), React 19, TailwindCSS, Radix UI.
- **Backend (`apps/api`):** [Express](https://expressjs.com/) & Node.js API server.
- **Background Jobs (`@codeunicorn/inngest`):** Powered by [Inngest](https://www.inngest.com/) for reliable event-driven background tasks (like queuing high-latency repository indexing or responding to asynchronous webhook PR events).

### Packages (`packages/*`)
- **`@codeunicorn/database`:** PostgreSQL with [Prisma ORM](https://www.prisma.io/).
- **`@codeunicorn/ai`:** **Retrieval-Augmented Generation (RAG)** pipeline using [Vercel AI SDK](https://sdk.vercel.ai/), Google GenAI, and Pinecone Vector DB for context-aware context retrieval.
- **`@codeunicorn/github`:** GitHub API integration using [Octokit](https://github.com/octokit).
- **`@codeunicorn/types` & `@codeunicorn/ui`:** Shared configurations and UI library.

### Infrastructure & Deployment
- **Containerization:** **Docker** and **Docker Compose** for local dev/prod containerization.
- **Orchestration:** **Kubernetes (K8s)** templates included (`k8s/`) for highly available production deployments.
- **CI/CD pipeline:** **GitHub Actions** (`.github/workflows/ci.yml`) lints, builds, and pushes containerized artifacts to **GitHub Container Registry (GHCR)**.

---

## 🐳 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone & Install
```bash
git clone https://github.com/your-username/codeunicorn-monorepo.git
cd codeunicorn-monorepo
pnpm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env` in the root and fill in the following critical keys:

```bash
cp .env.example .env
```

You must explicitly configure these environment variables in your root `.env`:
- `BETTER_AUTH_SECRET`: A random cryptographic string used to sign auth tokens and secure session data. (Run `openssl rand -base64 32` to generate).
- `BETTER_AUTH_URL`: The base URL pointing to the authentication server instance (e.g., `http://localhost:3000` or `http://localhost:4000` depending on where the auth middleware is mounted in your setup).
- `GITHUB_CLIENT_ID`: The Client ID from your registered GitHub App/OAuth App for user sign-in and API access.
- `GITHUB_CLIENT_SECRET`: The Client Secret matching your GitHub App/OAuth App required for issuing authentication tokens.
- `PINECONE_DB_API_KEY`: API Key for Pinecone Vector Database, crucial for the RAG architecture to store and query codebase embeddings.
- `GOOGLE_GENERATIVE_AI_API_KEY`: Key for the Google Generative AI models (e.g., Gemini) used by `@codeunicorn/ai` to perform code analysis and generation.
- `DATABASE_URL`: The connection string for the PostgreSQL database used by Prisma (e.g., `postgresql://user:password@localhost:5432/codeunicorn?schema=public`).

### 3. Database Setup
```bash
pnpm --filter @codeunicorn/database db:generate
pnpm --filter @codeunicorn/database db:push
```

### 4. Run Locally (with Turborepo)
To start the Next.js frontend, Express API API, and local background workers simultaneously:
```bash
pnpm dev
```

### 5. Run with Docker Compose
If you prefer running the entire stack (API, Web, DB) containerized locally:
```bash
docker-compose up --build
```
- Web UI: http://localhost:3000
- API Server: http://localhost:4000

---

## 🤝 Contributing
We love community contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started on how to submit pull requests, report issues, and improve the project.

Also, be sure to review our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for everyone.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
