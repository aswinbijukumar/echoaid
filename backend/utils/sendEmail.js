import sgMail from '@sendgrid/mail';
import logger from './prettyLogger.js';

// Initialize SendGrid with API key lazily
let sendGridInitialized = false;

const initializeSendGrid = () => {
  if (!sendGridInitialized) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendGridInitialized = true;
  }
};

const sendEmail = async (options) => {
  try {
    // Initialize SendGrid
    initializeSendGrid();

    logger.info('Sending email via SendGrid', {
      to: options.email,
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!(options.message || options.text),
      attachmentsCount: options.attachments ? options.attachments.length : 0
    }, 'EMAIL');

    // Prepare email data for SendGrid
    const msg = {
      to: options.email,
      from: `${process.env.EMAIL_FROM_NAME || 'EchoAid'} <${process.env.EMAIL_FROM}>`,
      subject: options.subject,
    };

    // Add text content
    if (options.message || options.text) {
      msg.text = options.message || options.text;
    }

    // Add HTML content
    if (options.html) {
      msg.html = options.html;
    }

    // Handle attachments (SendGrid format)
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map(attachment => ({
        content: attachment.content.toString('base64'),
        filename: attachment.filename,
        type: attachment.contentType || 'application/octet-stream',
        disposition: 'attachment'
      }));
    }

    // Send email via SendGrid
    const response = await sgMail.send(msg);

    logger.success('Email sent successfully via SendGrid', {
      messageId: response[0].headers['x-message-id'],
      to: options.email,
      subject: options.subject,
      statusCode: response[0].statusCode
    }, 'EMAIL');

    return {
      messageId: response[0].headers['x-message-id'],
      accepted: [options.email],
      rejected: [],
      statusCode: response[0].statusCode
    };

  } catch (error) {
    logger.errorWithStack('Email sending error', error, 'EMAIL');
    
    // Handle SendGrid specific errors
    if (error.response) {
      const { statusCode, body } = error.response;
      logger.error('SendGrid API error', { 
        statusCode, 
        body: body.errors || body 
      }, 'EMAIL');
      throw new Error(`SendGrid API error (${statusCode}): ${JSON.stringify(body.errors || body)}`);
    }
    
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;