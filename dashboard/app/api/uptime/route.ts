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

    return NextResponse.json(uptimeData);
  } catch (error: any) {
    console.error('Prometheus Proxy Error:', error.message);
    return NextResponse.json({ error: 'Failed to connect to local Prometheus instance. Is it running on port 9090?' }, { status: 502 });
  }
}
