const http = require('http');

const downtimeAlert = {
    alerts: [
        {
            status: 'firing',
            labels: {
                alertname: 'WebsiteDowntime',
                service: 'Nexus-Web-Core',
                severity: 'critical',
                instance: 'prod-website-01',
                target: 'https://your-main-site.com'
            },
            annotations: {
                summary: 'Critical: Website heartbeat failure detected via Blackbox Exporter',
                description: 'The probe_success metric for https://your-main-site.com has been 0 for more than 2 minutes. The site is likely unreachable.'
            },
            startsAt: new Date().toISOString()
        }
    ],
    status: 'firing',
    externalURL: 'http://prometheus:9090'
};

const data = JSON.stringify(downtimeAlert);

const options = {
    hostname: 'localhost',
    port: 3001, // The AI Analyzer port
    path: '/v1/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Simulation status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Simulation Failed (Is the AI-analyzer running on port 3001?):', error);
});

req.write(data);
req.end();

console.log('--- Triggering Web Downtime Simulation ---');
console.log('Site: https://your-main-site.com');
console.log('Sending payload to AI-Analyzer...');
