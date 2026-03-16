/**
 * SIEM Service: Detects security patterns from log streams and metrics.
 */

export interface SecurityAlert {
  pattern: string;
  severity: 'HIGH' | 'CRITICAL';
  description: string;
  source_ips: string[];
}

export const detectSecurityPatterns = (logs: string[]): SecurityAlert | null => {
  const combinedLogs = logs.join('\n').toLowerCase();
  
  // 1. Brute Force Detection (SSH / Web Login)
  const sshFailureCount = (combinedLogs.match(/failed password for|authentication failure|invalid user/g) || []).length;
  if (sshFailureCount > 10) {
    return {
      pattern: 'SSH_BRUTE_FORCE',
      severity: 'CRITICAL',
      description: `Detected ${sshFailureCount} failed login attempts in a short window. Possible brute-force attack.`,
      source_ips: extractIPs(combinedLogs)
    };
  }

  // 2. SQL Injection Patterns
  if (/union select|select @@version|' or '1'='1|waitfor delay/i.test(combinedLogs)) {
    return {
      pattern: 'SQL_INJECTION_ATTEMPT',
      severity: 'CRITICAL',
      description: 'Detected common SQL injection payloads in web request logs.',
      source_ips: extractIPs(combinedLogs)
    };
  }

  // 3. Path Traversal
  if (/\.\.\/\.\.\/|\/etc\/passwd|\/windows\/win\.ini/i.test(combinedLogs)) {
    return {
      pattern: 'PATH_TRAVERSAL',
      severity: 'HIGH',
      description: 'Detected attempts to access system files via directory traversal.',
      source_ips: extractIPs(combinedLogs)
    };
  }

  return null;
};

const extractIPs = (text: string): string[] => {
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  return Array.from(new Set(text.match(ipRegex) || []));
};
