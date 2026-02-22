import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'config.env') });

console.log('--- EMAIL DEBUGGER ---');
console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Present (' + process.env.SENDGRID_API_KEY.substring(0, 5) + '...)' : 'Missing');
console.log('From:', process.env.EMAIL_FROM);

const debugEmail = async () => {
    try {
        console.log('Attempting to send...');
        const result = await sendEmail({
            email: 'aswinblm10@gmail.com', // Sending to the address in config.env as typical user
            subject: 'EchoAid Live Debug Email',
            message: 'This is a test to verify if SendGrid is actually delivering.',
            html: '<h1>Debug Test</h1><p>Checking delivery status.</p>'
        });

        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.provider === 'sendgrid') {
            console.log('✅ System claims sent via SendGrid.');
            console.log('⚠️ If not received, account might be in "New Account Provisioning" (takes ~1 hour to activate) or in Spam.');
        } else if (result.provider === 'ethereal-fallback') {
            console.log('⚠️ Fallback Triggered! SendGrid failed. See error above.');
            console.log('🔗 Ethereal Preview:', result.previewUrl);
        }
    } catch (error) {
        console.error('❌ CRITICAL FAILURE:', error);
    }
};

debugEmail();
