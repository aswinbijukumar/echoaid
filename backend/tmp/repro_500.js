import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const secret = process.env.JWT_SECRET;
const userId = '6893a0d33e06e98ac669049c'; 
const token = jwt.sign({ id: userId }, secret, { expiresIn: '1d' });

async function testRecognize() {
    const imgPath = path.join(__dirname, 'test_hand.jpg');
    if (!fs.existsSync(imgPath)) {
        console.error('Image not found at', imgPath);
        return;
    }

    const form = new FormData();
    const blob = new Blob([fs.readFileSync(imgPath)], { type: 'image/jpeg' });
    form.append('image', blob, 'test_hand.jpg');

    try {
        console.log('Sending request to http://localhost:5000/api/practice/recognize...');
        const res = await fetch('http://localhost:5000/api/practice/recognize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testRecognize();
