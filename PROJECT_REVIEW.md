# Nexus SOC Dashboard: Complete Project Review

This document provides an exhaustive review of the Nexus SOC project, detailing every component, its purpose, and how it functions.

---

## 🏗️ 1. Holistic Architecture

Nexus is an **Autonomous Security Operations Center (SOC)**. It doesn't just monitor servers; it uses AI to understand what's wrong and suggest how to fix it.

### The Flow:
1.  **Monitoring Stack** (Prometheus/Blackbox) detects a failure (e.g., a website is down).
2.  **Alertmanager** sends a webhook notification.
3.  **AI Analyzer** (Fastify) receives the webhook.
4.  **Google Gemini AI** analyzes the alert along with historical context and logs.
5.  **Dashboard** (Next.js) displays the incident in real-time with an AI-generated root cause and remediation steps.

---

## 💻 2. Component-by-Component Breakdown

### 📂 `dashboard/` (The Face of Nexus)
-   **What is it?**: A Next.js 15 frontend.
-   **Why is it used?**: To provide a unified, real-time command center for infrastructure health.
-   **How it works**:
    -   Uses **React Server Components** for fast initial loads.
    -   **Framer Motion** provides the "premium" feel with smooth animations and transitions.
    -   **Tailwind CSS** handles the modern "Glassmorphism" UI (translucent, blurred backgrounds).
    -   **SSE (Server-Sent Events)**: Communicates with the AI Analyzer to show live log streams and incident updates without refreshing.

### 🤖 `ai-analyzer/` (The Brain of Nexus)
-   **What is it?**: A Fastify-based TypeScript backend.
-   **Why is it used?**: To bridge raw monitoring data with AI intelligence.
-   **How it works**:
    -   **Gemini Pro SDK**: Connects to Google's AI models. It is fed specific prompts containing the alert details (e.g., "CPU usage is 99% on Target X") and returns a human-readable analysis.
    -   **PostgreSQL**: Stores incidents permanently so the AI can look back at past failures for "correlation."
    -   **Incident Service**: Logic for creating, updating, and resolving alerts.
    -   **Automation Service**: Contains logic for suggested fixes (e.g., "Run database backup").

### 📊 `prometheus/`, `alertmanager/`, `blackbox/` (The Senses)
-   **Prometheus**: The database for metrics. It "scrapes" (polls) servers to check their health (CPU, RAM, Status).
-   **Blackbox Exporter**: Specifically used for "Probing." It checks if a website is reachable over HTTP/HTTPS from the outside.
-   **Alertmanager**: The filter. It decides when a metric becomes a "Problem" (Alert) and where to send the notification (to the AI Analyzer).

### 📜 `scripts/` (The Tools)
-   **`simulate-alert.js`**: A vital developer tool. It sends a fake HTTP request to the AI Analyzer that looks exactly like a real Prometheus alert. This allows testing the AI and Dashboard without actually breaking a server.
-   **`install-central.sh`**: A shell script to automate the deployment of the entire monitoring stack on a new VPS.

---

## 🛠️ 3. Technologies Used & Rationale

| Technology | Role | Why? |
| :--- | :--- | :--- |
| **Next.js 15** | Frontend Framework | Best-in-class performance, routing, and developer experience for modern dashboards. |
| **Fastify** | Backend API | Much faster than Express, providing high throughput for real-time alert processing. |
| **Google Gemini** | AI Logic | State-of-the-art LLM that understands technical logs and can provide remediation suggestions. |
| **Prometheus** | Metrics Engine | Industry standard for time-series monitoring; highly reliable and scalable. |
| **Loki** | Log Aggregator | Designed by the Grafana team; it's like Prometheus but for text logs. Very efficient. |
| **Tailwind CSS** | Styling | Allows for rapid UI development with a consistent design system. |
| **PostgreSQL** | Storage | Relational DB used for incident history and system state management. |

---

## 🔄 4. How They Work Together (The Ecosystem)

When you run `npm run dev` in the root:
1. `concurrently` starts both the **Dashboard (Port 3000)** and the **AI Analyzer (Port 3001)**.
2. The Dashboard connects to the AI Analyzer via a WebSocket/SSE stream.
3. If you click "Trigger Test Alert":
    - The Dashboard calls a route in `ai-analyzer`.
    - `ai-analyzer` contacts Gemini.
    - Gemini returns: *"The server is slow because the database connection limit was reached."*
    - `ai-analyzer` updates the DB and pushes the event to the Dashboard.
    - The Dashboard pops up a notification with a "Fix Now" button.

---

## 🔮 5. Key Highlights for Reviewers

-   **Sandbox Mode**: The project detects if live Prometheus servers are missing and automatically falls back to "Mock Data." This ensures the dashboard always looks alive during demonstrations.
-   **Terminal Simulation**: The interactive terminal in the dashboard isn't just a text box; it simulates a real Linux shell for viewing logs, giving a true SOC feeling.
-   **AI-Driven Root Cause**: Instead of just saying "Site is Down," the AI analyzes the *type* of error (403 vs 500) and gives specific advice (e.g., "Check permissions" vs "Check database connectivity").

---

## 🛠️ 6. Recent Changes & Maintenance

| Date | Change | Description |
| :--- | :--- | :--- |
| **March 17, 2026** | **Bug Fix: Login Credentials** | Corrected identity token mismatch to align with actual user email (`singhaanimesh216@gmail.com`). |
| **March 17, 2026** | **Feature: Interactive Auth** | Implemented a high-end, terminal-style security gateway using the user's credentials. |
| **March 17, 2026** | **UX: Mobile Responsiveness** | Refactored the global header and overview grid for multi-device support, ensuring a "GOD-like" look on any screen size. |
| **March 17, 2026** | **Bug Fix: Dashboard Crash** | Resolved a syntax error in `dashboard/app/page.tsx` that was causing a 500 error on the home page. |
| **March 17, 2026** | **Infrastructure: DB Setup** | Configured `Nexus_database` as the primary data store. Note: Local DB authentication for `incident_user` may require manual setup. |
| **March 17, 2026** | **Documentation Update** | Initialized `PROJECT_REVIEW.md` and established a policy to keep it updated with every feature/fix. |

---
*Created by Antigravity AI - Project Review March 2026*
