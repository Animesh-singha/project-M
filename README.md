# Nexus Autonomous SOC Module

[![Status](https://img.shields.io/badge/Status-Operational-emerald?style=for-the-badge)](http://localhost:3000)
[![Mode](https://img.shields.io/badge/Sandbox-Active-indigo?style=for-the-badge)](http://localhost:3000)

> **Quick Link**: [📖 Full Project Documentation](file:///c:/Users/s%20s%20laptop%20bazar/monitoring/DOCUMENTATION.md) - Tech Stack, Features, & Setup Explained.

## 🚀 Overview
Nexus is an autonomous monitoring platform that uses AI to detect and resolve infrastructure incidents. It integrates industry-standard telemetry (Prometheus, Loki, Blackbox Exporter) with Google Gemini AI to provide a high-end SOC (Security Operations Center) experience.

## ✨ Core Features

-   **Per-Website Telemetry Grid**: Dedicated live terminal streams for every monitored website.
-   **Autonomous AI Analysis**: Real-time incident summary and root cause determination using Google Gemini.
-   **Interactive Uptime Monitoring**: Instant status pills with one-click database backup functionality.
-   **Premium SOC Interface**: Ultra-modern UI with holographic mesh backgrounds, glassmorphism, and Framer Motion animations.
-   **Automatic Alerting**: End-to-end notification pipeline from Alertmanager to Gmail/Discord.

## 🏗️ Architecture

-   **Dashboard**: Next.js (React) unified interface.
-   **AI Analyzer**: Fastify (Node.js) backend for alert processing and AI logic.
-   **Monitoring Core**: Prometheus, Promtail, Loki, and Grafana (optional).
-   **Remediation**: AI-suggested fixes and automated snapshots.

## 🚀 Quick Start

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/Animesh-singha/project-M.git
    cd project-M
    ```

2.  **Environment Setup**:
    Configure `.env` files in both `dashboard` and `ai-analyzer` directories with your API keys.

3.  **Run Development Servers**:
    ```bash
    # Term 1: Dashboard
    cd dashboard && npm run dev

    # Term 2: AI Backend
    cd ai-analyzer && npm run start
    ```

## 🛠️ Tech Stack

-   **Frontend**: Next.js, Tailwind CSS, Framer Motion, Lucide Icons.
-   **Backend**: Fastify, TypeScript, Gemini Pro SDK.
-   **Observability**: Prometheus, Loki, Blackbox Exporter.

---
*Created with ❤️ for Advanced Infrastructure Monitoring.*
