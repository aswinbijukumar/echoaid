import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import logger from './prettyLogger.js';

let transporter = null;

const createTransporter = async () => {
  // 1. Try SendGrid if API key is present
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return { type: 'sendgrid' };
  }

  // 2. Try Gmail/SMTP if credentials exist
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
    return { type: 'nodemailer', transport: transporter };
  }

  // 3. Fallback to Ethereal (Test Account)
  return await createEtherealTransporter();
};

const createEtherealTransporter = async () => {
  logger.info('Creating Ethereal test account for email...', null, 'EMAIL');
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.warning('Using Ethereal Mail (Test Mode)', { user: testAccount.user }, 'EMAIL');
    return { type: 'nodemailer', transport: transporter };
  } catch (e) {
    logger.error('Failed to create Ethereal account', e, 'EMAIL');
    return { type: 'none' };
  }
};

const sendEmail = async (options) => {
  try {
    const config = await createTransporter();

    if (config.type === 'none') return { success: false, message: 'Email service disabled' };

    // Use SendGrid
    if (config.type === 'sendgrid') {
      const msg = {
        to: options.email,
        from: `${process.env.EMAIL_FROM_NAME || 'EchoAid'} <${process.env.EMAIL_FROM}>`,
        subject: options.subject,
        text: options.message || options.text,
        html: options.html,
      };
      if (options.attachments) {
        msg.attachments = options.attachments.map(a => ({
          content: a.content.toString('base64'),
          filename: a.filename,
          type: a.contentType || 'application/octet-stream',
          disposition: 'attachment'
        }));
      }

      await sgMail.send(msg);
      logger.success(`Email sent via SendGrid to ${options.email}`, null, 'EMAIL');
      return { success: true, provider: 'sendgrid' };
    }

    // Use Nodemailer
    return await sendViaNodemailer(config.transport, options);

  } catch (error) {
    logger.error('Primary email provider failed. Attempting fallback to Ethereal...', error, 'EMAIL');

    // Fallback: Try Ethereal
    try {
      const fallbackConfig = await createEtherealTransporter();
      if (fallbackConfig.type === 'nodemailer') {
        const result = await sendViaNodemailer(fallbackConfig.transport, {
          ...options,
          subject: `[FALLBACK] ${options.subject}`
        });
        // Override provider to indicate fallback
        return { ...result, provider: 'ethereal-fallback' };
      }
    } catch (fallbackError) {
      logger.errorWithStack('Email fallback failed', fallbackError, 'EMAIL');
    }

    return { success: false, error: error.message };
  }
};

const sendViaNodemailer = async (transport, options) => {
  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'EchoAid'} <${process.env.EMAIL_FROM || 'test@echoaid.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
    attachments: options.attachments
  };

  const info = await transport.sendMail(message);
  logger.success(`Email sent via Nodemailer to ${options.email}`, { messageId: info.messageId }, 'EMAIL');

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info(`📧 Preview Email URL: ${previewUrl}`, null, 'EMAIL');
    console.log(`\x1b[36m[EMAIL PREVIEW] View email at: ${previewUrl}\x1b[0m`);
  }

  return { success: true, provider: 'nodemailer', messageId: info.messageId, previewUrl };
};

export default sendEmail;