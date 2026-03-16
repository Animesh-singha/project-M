# Local Testing Guide: Nexus SOC

Follow these steps to get the Nexus SOC project running on your local machine.

## 1. Prerequisites
- **Node.js**: (v18+ recommended)
- **PostgreSQL**: Running locally or via Docker.
- **API Key**: A Google Gemini API key (should be placed in `.env` files).

## 2. Database Setup
Ensure PostgreSQL is running. The AI Analyzer will automatically create the `incidents` table on its first run if the database exists.
- **Default Database**: `incidents`
- **Default User**: `incident_user`
- **Default Password**: `incident_pass`
*(You can customize these in `ai-analyzer/.env`)*

## 3. Start Both Services Simultaneously
To run both the **Dashboard** and **AI Analyzer** at once from the root folder, run:
```bash
npm run dev
```
*(This uses `concurrently` to start both local servers in one terminal window.)*

## 4. Run Services Individually (Optional)
If you prefer to run them in separate terminals:

**Term 1: AI Analyzer**
```bash
cd ai-analyzer
npm run dev
```

**Term 2: Dashboard**
```bash
cd dashboard
npm run dev
```

## 5. Simulate an Alert (Testing the Flow)
To verify everything is working without setting up the full Prometheus stack, use the simulation script:
```bash
cd scripts
node simulate-alert.js
```
### What to expect:
1. The **AI Analyzer** terminal will show it received a webhook and is processing the alert with Gemini.
2. The **Dashboard** will automatically update with the new incident, showing the AI-generated root cause and suggested fix.

---
> [!TIP]
> If you want to test website downtime specifically, you can use `node simulate-down.js` in the `scripts` folder.
