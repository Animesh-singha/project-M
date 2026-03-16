/**
 * Event Service: Unified infrastructure event stream.
 * Correlates metrics, logs, actions, and deployments.
 */

export interface SystemEvent {
  id: string;
  timestamp: string;
  source: 'metric' | 'log' | 'deploy' | 'action' | 'ai';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
  service: string;
  metadata?: any;
}

// In-memory store for simulation (In production, this would be SQLite/Postgres)
let events: SystemEvent[] = [
  { 
    id: 'e1', 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    source: 'deploy', 
    severity: 'INFO', 
    message: 'Deployment v1.4.2 started', 
    service: 'nx-api-core' 
  },
  { 
    id: 'e2', 
    timestamp: new Date(Date.now() - 3550000).toISOString(), 
    source: 'metric', 
    severity: 'WARNING', 
    message: 'CPU Usage spike detected (88%)', 
    service: 'vps-nyc-02' 
  },
  { 
    id: 'e3', 
    timestamp: new Date(Date.now() - 3500000).toISOString(), 
    source: 'log', 
    severity: 'CRITICAL', 
    message: 'Nginx upstream timeout: Connection refused', 
    service: 'vps-nyc-02' 
  },
  { 
    id: 'e4', 
    timestamp: new Date(Date.now() - 3400000).toISOString(), 
    source: 'action', 
    severity: 'SUCCESS', 
    message: 'Admin restarted nginx service', 
    service: 'vps-nyc-02' 
  },
  { 
    id: 'e5', 
    timestamp: new Date(Date.now() - 3350000).toISOString(), 
    source: 'metric', 
    severity: 'INFO', 
    message: 'CPU usage stabilized (12%)', 
    service: 'vps-nyc-02' 
  }
];

export const addEvent = (event: Omit<SystemEvent, 'id' | 'timestamp'>) => {
  const newEvent: SystemEvent = {
    ...event,
    id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  events.push(newEvent);
  return newEvent;
};

export const getEvents = (limit: number = 50) => {
  return [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
};

export const getEventsByService = (service: string) => {
  return events.filter(e => e.service === service).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getIncidentTimeline = (incidentId: string) => {
  // In a real system, we would find the incident's start/end time and fetch events in that range.
  // For simulation, we return a subset of events that "correlate" to a target service.
  return events; 
};
export const getIncidentAnalysis = (incidentId: string) => {
  // Simulate AI analysis of the timeline
  return {
    incidentId,
    rootCause: "Memory exhaustion on vps-nyc-02 triggered an OOM swap spike, which subsequently caused the Nginx upstream worker to crash.",
    confidence: 94,
    impact: "High - All traffic to nx-api-core through this node was dropped for 140s.",
    suggestedFix: "Increase the memory limit for the nudge-api-container and optimize worker_connections in the Nginx config."
  };
};
