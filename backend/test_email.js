import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'config.env') });

console.log('Testing Email Sending...');

const testEmail = async () => {
    try {
        const result = await sendEmail({
            email: 'aswinblm10@gmail.com',
            subject: 'Test Email from EchoAid Debugger (Gmail SMTP)',
            message: 'If you receive this, the email service is working correctly.',
            html: '<h1>Success!</h1><p>Email service is configured correctly.</p>'
        });

        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('Provider:', result.provider);
            if (result.previewUrl) {
                console.log('🔗 Preview URL:', result.previewUrl);
            }
        } else {
            console.error('❌ Email Failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
};

testEmail();
