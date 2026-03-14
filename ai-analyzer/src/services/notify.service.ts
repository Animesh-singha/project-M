import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Email config
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendNotification = async (incident: any) => {
  const emoji = incident.severity === 'critical' ? '🚨' : incident.severity === 'warning' ? '⚠️' : 'ℹ️';
  
  const textMessage = `${emoji} **NEW INCIDENT**: ${incident.alert_name} 
**Target**: ${incident.service}
**Severity**: ${incident.severity.toUpperCase()}

**Summary**:
${incident.summary}

**Root Cause**:
${incident.root_cause}

**Suggested Fix**:
${incident.suggested_fix}
`;

  // 1. Send to Telegram
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: textMessage,
        parse_mode: 'Markdown'
      });
      console.log('Notification sent to Telegram');
    } catch (err: any) {
      console.error('Failed to send Telegram message:', err.message);
    }
  }

  // 2. Send to Discord
  if (DISCORD_WEBHOOK_URL) {
    try {
      await axios.post(DISCORD_WEBHOOK_URL, {
        content: textMessage.replace(/\*\*/g, '**') // Discord uses markdown natively
      });
      console.log('Notification sent to Discord');
    } catch (err: any) {
      console.error('Failed to send Discord message:', err.message);
    }
  }

  // 3. Send Email via Gmail
  if (SMTP_USER && SMTP_PASS && NOTIFY_EMAIL) {
    try {
      const mailOptions = {
        from: `"Monitoring SOC" <${SMTP_USER}>`,
        to: NOTIFY_EMAIL,
        subject: `${emoji} [${incident.severity.toUpperCase()}] Alert: ${incident.alert_name}`,
        text: textMessage,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${NOTIFY_EMAIL}`);
    } catch (err: any) {
      console.error('Failed to send Email notification:', err.message);
    }
  }
};
