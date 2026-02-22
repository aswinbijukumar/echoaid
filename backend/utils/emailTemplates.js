/**
 * EchoAid Standard Email Templates
 * Consistent styling and professional layout for all system emails.
 */

const getBaseTemplate = (title, bodyContent) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f6f8; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
        .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; color: #4B5563; }
        .footer { background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .otp-box { background-color: #EEF2FF; border: 2px dashed #6366F1; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0; border-radius: 8px; }
        .info-box { background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; font-size: 14px; }
        h2 { color: #111827; margin-top: 0; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>EchoAid</h1>
            <p style="color: #BFDBFE; margin: 5px 0 0;">${title}</p>
          </div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EchoAid. All rights reserved.</p>
            <p>Amal Jyothi College of Engineering, Kanjirappally, Kerala</p>
            <p>This is an automated message, please do not reply directly.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getVerificationEmail = (name, otp) => {
  const body = `
    <h2>Verify your Email Address</h2>
    <p>Hello ${name || 'User'},</p>
    <p>Welcome to EchoAid! To complete your registration and verify your account, please use the One-Time Password (OTP) below:</p>
    
    <div class="otp-box">${otp}</div>
    
    <p>This code will expire in 10 minutes for your security.</p>
    <div class="info-box">
      <strong>Note:</strong> If you did not create an account with EchoAid, please disregard this email.
    </div>
  `;
  return getBaseTemplate('Verify Your Account', body);
};

export const getResetPasswordEmail = (name, resetLink) => {
  const body = `
    <h2>Reset Your Password</h2>
    <p>Hello ${name || 'User'},</p>
    <p>We received a request to reset the password for your EchoAid account.</p>
    <p>Click the button below to set a new password:</p>
    
    <div style="text-align: center;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
    <p style="background: #f9fafb; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetLink}</p>
    
    <div class="info-box">
      This link is valid for 1 hour. If you didn't ask to reset your password, you can safely ignore this email.
    </div>
  `;
  return getBaseTemplate('Password Reset Request', body);
};

export const getPaymentSuccessEmail = (name, plan, amount, paymentId, date) => {
  const body = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">🎉</span>
    </div>
    <h2 style="text-align: center;">Payment Successful!</h2>
    <p>Hello ${name},</p>
    <p>Thank you for subscribing to EchoAid <strong>${plan}</strong>. Your payment has been processed successfully.</p>
    
    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Plan</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${plan}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Amount</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Date</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Reference ID</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right; font-family: monospace;">${paymentId}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
  `;
  return getBaseTemplate('Subscription Activated', body);
};

export const getWelcomeAdminEmail = (name, email, tempPassword, loginUrl) => {
  const body = `
    <h2>Welcome to the Team!</h2>
    <p>Hello ${name},</p>
    <p>An administrator has created an EchoAid Admin account for you.</p>
    
    <div style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #FECACA;">
      <h3 style="margin-top: 0; color: #991B1B;">Your Credentials</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
    </div>

    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">Login to Admin Portal</a>
    </div>
    
    <div class="info-box">
      <strong>Security Alert:</strong> Please change your password immediately after logging in.
    </div>
  `;
  return getBaseTemplate('Admin Account Created', body);
};

export const getAccountDeactivatedEmail = (name, reason) => {
  const body = `
     <h2>Account Deactivated</h2>
     <p>Hello ${name},</p>
     <p>Your EchoAid account has been deactivated by an administrator.</p>
     <div style="background-color: #FFF1F2; color: #BE123C; padding: 15px; border-radius: 6px; margin: 15px 0;">
       <strong>Reason:</strong> ${reason || 'Violation of terms or suspicious activity.'}
     </div>
      <p>If you believe this is an error, please contact our support team immediately.</p>
    `;
  return getBaseTemplate('Account Status Update', body);
};

export const getSubscriptionActivatedEmail = (name, plan, billingCycle, endDate) => {
  const body = `
    <h2>Welcome to EchoAid ${plan}!</h2>
    <p>Hello ${name},</p>
    <p>Your subscription has been successfully activated.</p>
    
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #166534;">Subscription Details</h3>
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
      <p style="margin: 5px 0;"><strong>Cycle:</strong> ${billingCycle}</p>
      <p style="margin: 5px 0;"><strong>Next Billing:</strong> ${endDate}</p>
    </div>

    <p>Thank you for choosing EchoAid! You now have full access to all features.</p>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
  `;
  return getBaseTemplate('Subscription Activated', body);
};

export const getSubscriptionCancelledEmail = (name, endDate) => {
  const body = `
    <h2>Subscription Cancelled</h2>
    <p>Hello ${name},</p>
    <p>We received your request to cancel your EchoAid subscription.</p>
    
    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 8px; margin: 20px 0; color: #991B1B;">
      <strong>Note:</strong> You will continue to have access to your current plan features until <strong>${endDate}</strong>.
    </div>

    <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime from your dashboard.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/subscription" class="button">View Subscription Options</a>
    </div>
  `;
  return getBaseTemplate('Subscription Cancelled', body);
};
