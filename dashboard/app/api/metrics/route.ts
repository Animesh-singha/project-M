import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = url.searchParams.get('target');
  const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://127.0.0.1:9090';

  try {
    // In production, we'd query:
    // 1. sum(rate(http_requests_total{instance="${target}"}[5m])) -> RPM
    // 2. histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{instance="${target}"}[5m])) by (le)) -> Latency
    // 3. (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 -> RAM %

    const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=probe_http_duration_seconds`);
    
    if (!response.ok) throw new Error('Prometheus unreachable');

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // SANDBOX MOCK DATA
    const mockWebsites = [
      { target: 'https://demo-bank.io', rpm: 142, latency: 48, memory: 865, cpu: 7, trend: 'up', vps: 'vps-lon-01' },
      { target: 'https://security-vault.net', rpm: 84, latency: 31, memory: 432, cpu: 11, trend: 'stable', vps: 'vps-lon-01' },
      { target: 'https://nexus-core-api.dev', rpm: 8, latency: 462, memory: 1950, cpu: 64, trend: 'down', vps: 'vps-nyc-02' },
      { target: 'https://global-cdn.com', rpm: 1105, latency: 14, memory: 115, cpu: 3, trend: 'up', vps: 'vps-sg-03' }
    ];

    const mockServers = [
      { hostname: 'vps-lon-01', ip: '45.12.88.101', ram_used: 1.4, ram_total: 4, cpu_load: 12, status: 'online' },
      { hostname: 'vps-nyc-02', ip: '104.21.5.22', ram_used: 6.8, ram_total: 8, cpu_load: 45, status: 'online' },
      { hostname: 'vps-sg-03', ip: '209.15.200.4', ram_used: 1.1, ram_total: 2, cpu_load: 85, status: 'online' },
      { hostname: 'vps-backup-04', ip: '192.168.1.15', ram_used: 0.8, ram_total: 4, cpu_load: 2, status: 'online' }
    ];

    if (target) {
        const single = mockWebsites.find(m => m.target.includes(target.replace(/https?:\/\//, ''))) || mockWebsites[0];
        return NextResponse.json(single);
    }

    return NextResponse.json({ websites: mockWebsites, servers: mockServers });
  }
}
