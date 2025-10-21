import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:5000';

async function testUploadEndpoint() {
  try {
    console.log('Testing upload endpoint...');
    
    // Test the test endpoint first
    const testResponse = await fetch(`${API_BASE_URL}/api/admin/upload/test`);
    const testData = await testResponse.json();
    console.log('Test endpoint response:', testData);
    
    if (!testData.success) {
      throw new Error('Test endpoint failed');
    }
    
    console.log('✅ Upload endpoint is accessible');
    
    // Create a simple test file
    const testContent = 'This is a test file for upload';
    const testFilePath = path.join(process.cwd(), 'test-upload.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('Created test file:', testFilePath);
    
    // Test file upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    
    const uploadResponse = await fetch(`${API_BASE_URL}/api/admin/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth, but we can see the response
      }
    });
    
    console.log('Upload response status:', uploadResponse.status);
    
    if (uploadResponse.status === 401) {
      console.log('✅ Upload endpoint is working (authentication required)');
    } else {
      const responseData = await uploadResponse.json();
      console.log('Upload response:', responseData);
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }
}

testUploadEndpoint();