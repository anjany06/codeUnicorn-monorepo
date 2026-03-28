# 🦄 CodeUnicorn

**CodeUnicorn is an intelligent GitHub Intelligence Platform that enhances your engineering workflows by combining automated PR reviews, codebase understanding, and developer analytics into one unified tool.**

It serves as a smart AI companion for developers, helping teams review code faster, understand projects better, and track engineering growth over time.

---

## 🚀 Key Features

- **🧠 Intelligent PR Reviews:** Context-aware automated pull request reviews that actually understand your codebase. Catch issues, enforce standards, and suggest improvements directly on GitHub.
- **📊 Developer Insights Dashboard:** Track developer activity, growth, commits, PRs, and AI reviews. Visualize work with customizable contribution graphs and discover insights like streaks and monthly trends.
- **💬 Codebase Chat System:** Ask questions about your repository and get context-aware answers instantly based on the indexed codebase and vector embeddings.
- **⚡ AI-Powered Issue Analysis:** Automatically analyze GitHub issues to suggest relevant files for fixes and apply appropriate labels.
- **📚 AI Documentation Generation:** Effortlessly generate READMEs, onboarding guides, and system design documents based on your actual codebase structure.
- **⚙️ Deep Customization:** Control how AI reviews your code by configuring focus areas, ignore paths, and custom review rules.

---

## 🛠️ Architecture & Tech Stack

CodeUnicorn is built as a highly scalable **Turborepo** monorepo, utilizing modern tools for the frontend, backend, AI processing, and infrastructure.

### Application Layer
- **Frontend (`apps/web`):** [Next.js](https://nextjs.org/) (App Router), React 19, TailwindCSS, Radix UI, Framer Motion, Recharts.
- **Backend (`apps/api`):** [Express](https://expressjs.com/) & Node.js API server.
- **Background Jobs (`@codeunicorn/inngest`):** Powered by [Inngest](https://www.inngest.com/) for reliable event-driven background tasks (PR indexing, webhooks processing).

### Packages (`packages/*`)
- **`@codeunicorn/database`:** PostgreSQL with [Prisma ORM](https://www.prisma.io/).
- **`@codeunicorn/ai`:** [Vercel AI SDK](https://sdk.vercel.ai/) with Google Generative AI and Pinecone Vector Database for context-aware Retrieval-Augmented Generation (RAG).
- **`@codeunicorn/github`:** GitHub API integration using [Octokit](https://github.com/octokit).
- **`@codeunicorn/types`:** Shared TypeScript interfaces and Zod schemas across the monorepo.
- **`@codeunicorn/config` / `eslint-config` / `typescript-config`:** Shared tooling configurations.

### Infrastructure & Deployment
- **Containerization:** **Docker** and **Docker Compose** for local development and production containerization.
- **Orchestration:** **Kubernetes (K8s)** templates included (`k8s/`) for highly available production deployments (Deployments, Services, Ingress, HPA).
- **CI/CD pipeline:** **GitHub Actions** (`.github/workflows/ci.yml`) is configured to:
  - Lint, format, and type-check code on every PR.
  - Automatically build Docker images on merging to `main`.
  - Push containerized artifacts to **GitHub Container Registry (GHCR)**.

---

## 🐳 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- [Docker](https://www.docker.com/) & Docker Compose
- A PostgreSQL database (or use Docker)
- Pinecone API Key (for vector embeddings)
- Google Gemini / AI Provider Key
- GitHub App Credentials (for webhook ingestion and PR comments)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/codeunicorn-monorepo.git
cd codeunicorn-monorepo
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root and individual apps/packages and fill in your keys.
```bash
cp .env.example .env
```

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
If you prefer running the entire stack (API, Web, DB, and Redis if applicable) containerized locally:
```bash
docker-compose up --build
```
- Web UI: http://localhost:3000
- API Server: http://localhost:4000

---

## 🌩️ Production Deployment

### 1. Build & Push via CI/CD
CodeUnicorn is already configured with GitHub Actions to push images to **GHCR**.
Whenever you push to `main`, the CI pipeline will automatically build and publish:
- `ghcr.io/<your-username>/codeunicorn-api:latest`
- `ghcr.io/<your-username>/codeunicorn-web:latest`

### 2. Kubernetes Deployment
A complete set of production-ready Kubernetes manifests is provided in the `k8s/` directory.

Deploy to your cluster using `Kustomize` or standard `kubectl`:
```bash
# Setup secrets first
kubectl create secret generic codeunicorn-api-secrets --from-env-file=.env.production -n codeunicorn

# Deploy the stack
kubectl apply -k k8s/overlays/prod
```
The Kubernetes configuration includes `web` and `api` Deployments, Services, Horizontal Pod Autoscalers (HPA), and Ingress routing.

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

CodeUnicorn runs linting (`eslint`), typescript checks (`tsc`), and formatting on the CI pipeline via Turborepo caching.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
