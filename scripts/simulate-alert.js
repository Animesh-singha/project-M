const axios = require('axios');

async function triggerFakeAlert() {
  const alertPayload = {
    "receiver": "ai-analyzer",
    "status": "firing",
    "alerts": [
      {
        "status": "firing",
        "labels": {
          "alertname": "PostgresHighConnections",
          "severity": "critical",
          "instance": "local-sandbox-db",
          "job": "postgres"
        },
        "annotations": {
          "summary": "Database connection pool exhausted.",
          "description": "PostgreSQL database has 102 active connections, exceeding the warning threshold of 100."
        },
        "startsAt": new Date().toISOString()
      }
    ],
    "groupLabels": { "alertname": "PostgresHighConnections" },
    "commonLabels": { "severity": "critical" },
    "commonAnnotations": {}
  };

  try {
    console.log("🔥 Firing dummy alert to the AI Analyzer Webhook (http://localhost:3001)...");
    const response = await axios.post('http://localhost:3001/v1/webhook', alertPayload);
    console.log("✅ Alert sent successfully! Webhook response:", response.status);
    console.log("⏳ Wait about 5-10 seconds for the AI to process it and see it appear in the dashboard!");
  } catch (err) {
    console.error("❌ Failed to send alert. Is the ai-analyzer service running on port 3001?");
  }
}

triggerFakeAlert();
