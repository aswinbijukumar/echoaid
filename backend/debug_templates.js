import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './utils/sendEmail.js';
import { getSubscriptionActivatedEmail } from './utils/emailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'config.env') });

console.log('--- TEMPLATE DEBUGGER ---');

const debugTemplates = async () => {
    try {
        console.log('Generating HTML from template...');
        const html = getSubscriptionActivatedEmail(
            'Test User',
            'Pro Plan',
            'Monthly',
            '12/12/2026'
        );
        console.log('HTML Generated (Length):', html.length);

        console.log('Attempting to send...');
        const result = await sendEmail({
            email: 'aswinblm10@gmail.com',
            subject: 'EchoAid Template Debug',
            html: html
        });

        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ TEMPLATE ERROR:', error);
    }
};

debugTemplates();
