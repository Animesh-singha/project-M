# Nexus Monitoring System: Full Project Documentation

## 🚀 Overview
Nexus is an advanced, autonomous Security Operations Center (SOC) and monitoring platform. It is designed to monitor multi-site infrastructure across several VPS nodes, featuring AI-driven incident analysis, real-time log streaming, and infrastructure health visualization.

---

## 🛠️ Technology Stack

### **Core Frameworks**
*   **Frontend**: [Next.js 15 (App Router)](https://nextjs.org/) - High-performance React framework for the dashboard.
*   **Backend (AI Service)**: [Fastify](https://www.fastify.io/) - Ultra-fast Node.js web framework for the AI Analyzer.
*   **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database for storing incident logs and system state.

### **Monitoring Stack**
*   **Metrics**: [Prometheus](https://prometheus.io/) - Scrapes and stores time-series performance data.
*   **Logging**: [Grafana Loki](https://grafana.com/oss/loki/) - Horizontally-scalable, highly-available log aggregation system.
*   **Alerting**: [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) - Handles alerts sent by Prometheus.
*   **Probing**: [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter) - Allows monitoring of endpoints over HTTP/S, TCP, etc.

### **AI & Intelligence**
*   **AI Engine**: [Google Gemini Pro](https://ai.google.dev/) - Powers the autonomous incident resolution and summary generation.

### **UI & Styling**
*   **Styling**: [Vanilla CSS / Tailwind CSS](https://tailwindcss.com/) - Premium, high-end aesthetics with custom glassmorphism.
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) - Smooth, interactive layout transitions.
*   **Icons**: [Lucide React](https://lucide.dev/) - Modern, consistent icon set.

---

## 🌟 Core Features

### 1. **Fleet Intelligence Dashboard**
*   **Sectional Layout**: Navigation split into Overview, Infrastructure, Web Assets, and Live Errors.
*   **Health Pie Chart**: Visual distribution of online vs. offline targets.
*   **VPS Health Grid**: Real-time RAM and CPU monitoring for 2-4 distributed VPS nodes.

### 2. **Interactive Live Monitoring**
*   **Site Cards**: Summary views of website RPM, Latency, and Memory.
*   **Interactive Modal**: Click any card to open a full-scale, real-time log terminal.
*   **Error Stream**: A consolidated feed that filters global logs for critical keywords (ERROR, FAILED, CRITICAL).

### 3. **Autonomous AI Analyzer**
*   **Incident Resolution**: Automatically analyzes incoming alerts, identifies root causes, and suggests remediation fixes.
*   **Contextual Awareness**: Feeds real-time metrics and logs into the Gemini AI for precise analysis.

### 4. **Sandbox Mode (Demo Environment)**
*   **Mock Fallbacks**: Automatically activates if Prometheus or Loki are unreachable.
*   **Simulated Traffic**: Generates realistic fluctuating metrics and log streams for testing without live infrastructure.
*   **Manual Trigger**: "Trigger Test Alert" button to manually simulate a production incident.

---

## 📁 Project Structure

```text
/
├── dashboard/           # Next.js Frontend Application
│   ├── app/             # App Router (Pages & API Routes)
│   ├── components/      # Reusable UI Components (SiteCard, ErrorStream, etc.)
│   └── public/          # Static Assets
├── ai-analyzer/         # Fastify AI Processing Service
│   ├── src/             # Source code (Services, Routes, Database logic)
│   └── .env             # Gemini API Configuration
├── prometheus/          # Prometheus Configuration
├── alertmanager/        # Alertmanager Rules
├── testing_guide.md     # Dedicated guide for Sandbox & Local testing
└── DOCUMENTATION.md      # This comprehensive guide
```

---

## ⚙️ Local Setup & Deployment

### **Prerequisites**
*   Node.js (v18+)
*   npm
*   PostgreSQL (Optional for Sandbox Mode)

### **Quick Start**
1.  **Install Dependencies**:
    ```bash
    npm run install-all
    ```
2.  **Configure AI**:
    Add your `GEMINI_API_KEY` to `ai-analyzer/.env`.
3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    *   Dashboard: [http://localhost:3000](http://localhost:3000)
    *   AI Service: [http://localhost:3001](http://localhost:3001)

### **Docker Support**
*   The project includes configurations for containerized deployment (Prometheus, Loki, Alertmanager).

---

## 🔒 Security Policy
Nexus uses a "Lowest Privilege" principle for data access. Log streams are filtered at the API layer, and critical system alerts are encrypted before being processed by the AI engine.

---
*Documentation updated: March 16, 2026*
