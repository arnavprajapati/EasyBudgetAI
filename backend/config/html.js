export const getOtpHtml = ({ email, otp }) => {
  const appName = process.env.APP_NAME || "SmartKhata";
  
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${appName} Verification Code</title>
    <style>
      html, body { margin: 0; padding: 0; }
      body {
        background: #f6f9fc;
        color: #24292f;
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      }
      table { border-collapse: collapse; }
      
      .wrapper { width: 100%; background: #f6f9fc; padding: 40px 0; }
      .container { width: 100%; max-width: 480px; }
      
      .logo-section { text-align: center; padding-bottom: 24px; }
      .logo {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 12px;
        display: inline-block;
        line-height: 48px;
        color: #fff;
        font-weight: 700;
        font-size: 24px;
      }
      
      .heading {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #24292f;
        margin: 0 0 32px 0;
      }
      .heading strong { font-weight: 700; }
      
      .content-box {
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 24px;
        margin-bottom: 16px;
      }
      
      .label {
        font-size: 14px;
        color: #57606a;
        margin: 0 0 16px 0;
      }
      
      .otp-code {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #2563eb;
        text-align: center;
        margin: 16px 0;
        padding: 12px;
        background: #eff6ff;
        border-radius: 6px;
      }
      
      .validity {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      .validity strong { color: #2563eb; }
      
      .warning {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      .warning strong { font-weight: 600; }
      
      .signature {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      
      .footer-note {
        font-size: 12px;
        color: #57606a;
        text-align: left;
        margin: 24px 0 0 0;
        padding-top: 16px;
        border-top: 1px solid #d0d7de;
      }
      
      .footer {
        text-align: center;
        font-size: 12px;
        color: #6e7781;
        padding-top: 24px;
      }
    </style>
  </head>
  <body>
    <table role="presentation" class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" class="container" border="0" cellspacing="0" cellpadding="0">
            <!-- Logo -->
            <tr>
              <td class="logo-section">
                <div class="logo">S</div>
              </td>
            </tr>
            
            <!-- Heading -->
            <tr>
              <td>
                <h1 class="heading">Please verify your identity, <strong>${email.split('@')[0]}</strong></h1>
              </td>
            </tr>
            
            <!-- Content Box -->
            <tr>
              <td>
                <div class="content-box">
                  <p class="label">Here is your ${appName} authentication code:</p>
                  
                  <div class="otp-code">${otp}</div>
                  
                  <p class="validity">This code is valid for <strong>5 minutes</strong> and can only be used once.</p>
                  
                  <p class="warning"><strong>Please don't share this code with anyone:</strong> we'll never ask for it on the phone or via email.</p>
                  
                  <p class="signature">Thanks,<br>The ${appName} Team</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer Note -->
            <tr>
              <td class="footer-note">
                You're receiving this email because a verification code was requested for your ${appName} account. If this wasn't you, please ignore this email.
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer">
                ${appName}, Inc. &middot; Made with ♥ in India
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return html;
};

export const getVerifyEmailHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "SmartKhata";
  const baseUrl = process.env.FRONTEND_URL || "https://www.smartkhata.me";

  const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(
    token
  )}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${appName} Verify Your Account</title>
    <style>
      html, body { margin: 0; padding: 0; }
      body {
        background: #f6f9fc;
        color: #24292f;
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      }
      table { border-collapse: collapse; }
      
      .wrapper { width: 100%; background: #f6f9fc; padding: 40px 0; }
      .container { width: 100%; max-width: 480px; }
      
      .logo-section { text-align: center; padding-bottom: 24px; }
      .logo {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 12px;
        display: inline-block;
        line-height: 48px;
        color: #fff;
        font-weight: 700;
        font-size: 24px;
      }
      
      .heading {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #24292f;
        margin: 0 0 32px 0;
      }
      .heading strong { font-weight: 700; }
      
      .content-box {
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 24px;
        margin-bottom: 16px;
      }
      
      .label {
        font-size: 14px;
        color: #57606a;
        margin: 0 0 16px 0;
      }
      
      .btn-wrapper { text-align: center; margin: 24px 0; }
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .link-fallback {
        font-size: 12px;
        color: #57606a;
        margin: 16px 0 0 0;
        word-break: break-all;
      }
      .link-fallback a { color: #2563eb; }
      
      .validity {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      .validity strong { color: #2563eb; }
      
      .signature {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      
      .footer-note {
        font-size: 12px;
        color: #57606a;
        text-align: left;
        margin: 24px 0 0 0;
        padding-top: 16px;
        border-top: 1px solid #d0d7de;
      }
      
      .footer {
        text-align: center;
        font-size: 12px;
        color: #6e7781;
        padding-top: 24px;
      }
    </style>
  </head>
  <body>
    <table role="presentation" class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" class="container" border="0" cellspacing="0" cellpadding="0">
            <!-- Logo -->
            <tr>
              <td class="logo-section">
                <div class="logo">S</div>
              </td>
            </tr>
            
            <!-- Heading -->
            <tr>
              <td>
                <h1 class="heading">Verify your account, <strong>${email.split('@')[0]}</strong></h1>
              </td>
            </tr>
            
            <!-- Content Box -->
            <tr>
              <td>
                <div class="content-box">
                  <p class="label">Thanks for registering with ${appName}! Click the button below to verify your email address:</p>
                  
                  <div class="btn-wrapper">
                    <a class="btn" href="${verifyUrl}" target="_blank" rel="noopener">Verify Email Address</a>
                  </div>
                  
                  <p class="validity">This link is valid for <strong>5 minutes</strong> and can only be used once.</p>
                  
                  <p class="link-fallback">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${verifyUrl}">${verifyUrl}</a>
                  </p>
                  
                  <p class="signature">Thanks,<br>The ${appName} Team</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer Note -->
            <tr>
              <td class="footer-note">
                You're receiving this email because you signed up for a ${appName} account. If this wasn't you, please ignore this email.
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer">
                ${appName}, Inc. &middot; Made with ♥ in India
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return html;
};

export const getResetPasswordHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "SmartKhata";
  const baseUrl = process.env.FRONTEND_URL || "https://www.smartkhata.me";

  const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password/${encodeURIComponent(
    token
  )}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${appName} Reset Your Password</title>
    <style>
      html, body { margin: 0; padding: 0; }
      body {
        background: #f6f9fc;
        color: #24292f;
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      }
      table { border-collapse: collapse; }
      
      .wrapper { width: 100%; background: #f6f9fc; padding: 40px 0; }
      .container { width: 100%; max-width: 480px; }
      
      .logo-section { text-align: center; padding-bottom: 24px; }
      .logo {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 12px;
        display: inline-block;
        line-height: 48px;
        color: #fff;
        font-weight: 700;
        font-size: 24px;
      }
      
      .heading {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #24292f;
        margin: 0 0 32px 0;
      }
      .heading strong { font-weight: 700; }
      
      .content-box {
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 24px;
        margin-bottom: 16px;
      }
      
      .label {
        font-size: 14px;
        color: #57606a;
        margin: 0 0 16px 0;
      }
      
      .btn-wrapper { text-align: center; margin: 24px 0; }
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .link-fallback {
        font-size: 12px;
        color: #57606a;
        margin: 16px 0 0 0;
        word-break: break-all;
      }
      .link-fallback a { color: #2563eb; }
      
      .validity {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      .validity strong { color: #2563eb; }
      
      .warning {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      
      .signature {
        font-size: 14px;
        color: #24292f;
        margin: 16px 0 0 0;
      }
      
      .footer-note {
        font-size: 12px;
        color: #57606a;
        text-align: left;
        margin: 24px 0 0 0;
        padding-top: 16px;
        border-top: 1px solid #d0d7de;
      }
      
      .footer {
        text-align: center;
        font-size: 12px;
        color: #6e7781;
        padding-top: 24px;
      }
    </style>
  </head>
  <body>
    <table role="presentation" class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" class="container" border="0" cellspacing="0" cellpadding="0">
            <!-- Logo -->
            <tr>
              <td class="logo-section">
                <div class="logo">S</div>
              </td>
            </tr>
            
            <!-- Heading -->
            <tr>
              <td>
                <h1 class="heading">Reset your password, <strong>${email.split('@')[0]}</strong></h1>
              </td>
            </tr>
            
            <!-- Content Box -->
            <tr>
              <td>
                <div class="content-box">
                  <p class="label">We received a request to reset the password for your ${appName} account. Click the button below to set a new password:</p>
                  
                  <div class="btn-wrapper">
                    <a class="btn" href="${resetUrl}" target="_blank" rel="noopener">Reset Password</a>
                  </div>
                  
                  <p class="validity">This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
                  
                  <p class="link-fallback">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                  </p>
                  
                  <p class="warning">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
                  
                  <p class="signature">Thanks,<br>The ${appName} Team</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer Note -->
            <tr>
              <td class="footer-note">
                You're receiving this email because a password reset was requested for your ${appName} account. If this wasn't you, please ignore this email.
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer">
                ${appName}, Inc. &middot; Made with ♥ in India
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return html;
};
