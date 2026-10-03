const nodemailer = require('nodemailer');

const GMAIL_SENDER = process.env.GMAIL_USER || 'reminiplayapp@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'vjgr gbbd cjgy xfmg';

// Create reusable transporter object using direct Gmail SMTP
const createTransporter = () => {
  if (!GMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_SENDER,
      pass: GMAIL_PASS,
    },
  });
};

/**
 * Send OTP Verification Email from reminiplayapp@gmail.com
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit verification code
 * @param {string} purpose - 'signup' | 'password_reset'
 */
const sendOTPEmail = async (to, otp, purpose = 'signup') => {
  const isReset = purpose === 'password_reset';
  const subject = isReset 
    ? `🔑 ${otp} is your ReminiPlay Password Reset Code`
    : `✨ ${otp} is your ReminiPlay Account Verification Code`;

  const title = isReset ? 'Password Reset Verification' : 'Welcome to ReminiPlay!';
  const messageText = isReset
    ? 'You requested to reset your password. Use the verification code below to set a new password:'
    : 'Thank you for joining ReminiPlay. Use the verification code below to verify your email and activate your account:';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #f5f3ff; border: 2px dashed #8b5cf6; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #6d28d9; font-family: monospace; }
        .expiry { font-size: 13px; color: #64748b; margin-top: 8px; }
        .security-alert { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin-top: 24px; line-height: 1.5; }
        .footer { padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🧠 ReminiPlay</h1>
          <p>Cognitive Health & Gesture Play Platform</p>
        </div>
        <div class="body">
          <div class="greeting">${title}</div>
          <div class="text">${messageText}</div>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ Valid for 10 minutes</div>
          </div>
          
          <div class="security-alert">
            🔒 <strong>Security Warning:</strong> ReminiPlay will never ask you to disclose this code. Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          Sent by ReminiPlay Security Team (${GMAIL_SENDER})<br>
          © ${new Date().getFullYear()} ReminiPlay. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`⚠️  [GMAIL NOTICE] GMAIL_APP_PASSWORD not set in .env`);
    console.log(`📧  From: ${GMAIL_SENDER}`);
    console.log(`📬  To: ${to}`);
    console.log(`🔑  Purpose: ${purpose.toUpperCase()} | OTP CODE: [ ${otp} ]`);
    console.log(`======================================================\n`);
    return {
      success: true,
      deliveredLive: false,
      message: `OTP generated for ${to}. To send live emails from ${GMAIL_SENDER}, set GMAIL_APP_PASSWORD in backend/.env`,
      code: otp // Returned for test/dev convenience
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"ReminiPlay Security" <${GMAIL_SENDER}>`,
      to,
      subject,
      text: `${isReset ? 'Your ReminiPlay password reset code is:' : 'Your ReminiPlay verification code is:'} ${otp}. It will expire in 10 minutes.`,
      html: htmlContent,
    });

    console.log(`✅ [GMAIL SENT] OTP delivered to ${to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      deliveredLive: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ [GMAIL ERROR] Failed to send email to ${to}:`, error.message);
    console.log(`🔑 Fallback OTP for ${to}: [ ${otp} ]`);
    return {
      success: true,
      deliveredLive: false,
      error: error.message,
      message: `Email sending encountered an error: ${error.message}. Fallback code active.`,
      code: otp
    };
  }
};

module.exports = {
  sendOTPEmail,
  GMAIL_SENDER,
};
