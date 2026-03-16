/**
 * Control Service: Executes system commands on target nodes via SSH.
 * In a sandbox environment, we simulate these actions and log them.
 */

export interface ControlActionResult {
  success: boolean;
  message: string;
  command: string;
}

export const executeServerAction = async (target: string, action: string): Promise<ControlActionResult> => {
  console.log(`[CONTROL] Initiating action ${action} on target ${target}...`);

  // Map user actions to actual Linux commands
  let command = '';
  switch (action) {
    case 'RESTART_NGINX':
      command = 'systemctl restart nginx';
      break;
    case 'RESTART_NODE':
      command = 'pm2 restart all';
      break;
    case 'CLEANUP_DISK':
      command = 'rm -rf /tmp/* && apt-get clean';
      break;
    case 'REBOOT':
      command = 'reboot';
      break;
    default:
      throw new Error(`Invalid server action: ${action}`);
  }

  // Simulate network latency and execution
  await new Promise(resolve => setTimeout(resolve, 1500));

  const success = Math.random() > 0.05; // 95% success rate for simulation

  return {
    success,
    message: success ? `Successfully executed ${action} on ${target}` : `Failed to execute ${action} on ${target}: Connection timeout`,
    command
  };
};
