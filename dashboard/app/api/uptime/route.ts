import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://127.0.0.1:9090';

  try {
    // Query prometheus for the latest probe_success metric from the blackbox exporter
    const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=probe_success`);
    
    if (!response.ok) {
       return NextResponse.json({ error: 'Prometheus connection failed', status: response.status }, { status: 502 });
    }

    const data = await response.json();
    
    // Parse format into easy objects for the frontend
    const results = data.data?.result || [];
    const uptimeData = results.map((res: any) => ({
      target: res.metric.instance || 'Unknown Target',
      status: res.value[1] === '1' ? 'UP' : 'DOWN'
    }));

    // If no real data, return empty to trigger sandbox check in frontend or just return mock here
    if (uptimeData.length === 0) throw new Error('No targets found');

    return NextResponse.json(uptimeData);
  } catch (error: any) {
    console.warn('Prometheus unavailable, serving Sandbox/Demo data.');
    
    // SANDBOX FALLBACK DATA
    const sandboxData = [
      { target: 'https://demo-bank.io', status: 'UP' },
      { target: 'https://security-vault.net', status: 'UP' },
      { target: 'https://nexus-core-api.dev', status: 'DOWN' },
      { target: 'https://global-cdn.com', status: 'UP' }
    ];

    return NextResponse.json(sandboxData);
  }
}
