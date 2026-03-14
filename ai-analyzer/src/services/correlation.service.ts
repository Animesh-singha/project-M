import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';
const LOKI_URL = process.env.LOKI_URL || 'http://localhost:3100';

export const gatherContext = async (instanceName?: string) => {
  let metricsContext = '';
  let logsContext = '';

  if (!instanceName) return { metricsContext, logsContext };

  try {
    // 1. Gather recent standard metrics for the instance (Event Correlation)
    // CPU Query
    const cpuQuery = encodeURIComponent(`100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle", instance="${instanceName}"}[5m])) * 100)`);
    const cpuRes = await axios.get(`${PROMETHEUS_URL}/api/v1/query?query=${cpuQuery}`);
    
    // Memory Query
    const memQuery = encodeURIComponent(`(1 - (node_memory_MemAvailable_bytes{instance="${instanceName}"} / node_memory_MemTotal_bytes{instance="${instanceName}"})) * 100`);
    const memRes = await axios.get(`${PROMETHEUS_URL}/api/v1/query?query=${memQuery}`);

    metricsContext = `
    Last 5m Metrics for ${instanceName}:
    CPU Load: ${cpuRes.data?.data?.result?.[0]?.value?.[1] || 'N/A'}%
    Memory Usage: ${memRes.data?.data?.result?.[0]?.value?.[1] || 'N/A'}%
    `;

    // 2. Gather Loki Logs for the instance (last 5 minutes)
    // Using simple varlogs query
    const timeNow = new Date().getTime() * 1000000; // nanoseconds
    const time5MinsAgo = timeNow - (5 * 60 * 1000 * 1000000);
    const logQuery = encodeURIComponent(`{instance="${instanceName}"} |= "error"`);
    
    const lokiRes = await axios.get(`${LOKI_URL}/loki/api/v1/query_range?query=${logQuery}&start=${time5MinsAgo}&end=${timeNow}&limit=20`);
    
    if (lokiRes.data?.data?.result?.length > 0) {
      logsContext = "Recent Error Logs:\n" + lokiRes.data.data.result.map((r: any) => 
        r.values.map((v: any) => v[1]).join('\n')
      ).join('\n');
    }

  } catch (err) {
    console.error('Failed to gather context metrics/logs', err);
  }

  return { metricsContext, logsContext };
};
