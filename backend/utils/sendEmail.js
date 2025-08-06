import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Define email options
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    // Send email
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail; 