// import { jsPDF } from 'jspdf'; // Removed - using PDFKit instead
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateInvoicePDF = (paymentData, userData) => {
  // Simple text-based invoice generation for now
  const invoiceContent = `
INVOICE
=======

Invoice #: ${paymentData.orderId}
Date: ${new Date().toLocaleDateString()}
Payment ID: ${paymentData.paymentId}

Bill To:
--------
Name: ${userData.name || 'User'}
Email: ${userData.email}

Subscription Details:
--------------------
Description: ${paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)} Subscription
Plan: ${paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)}
Billing Cycle: ${paymentData.billingCycle.charAt(0).toUpperCase() + paymentData.billingCycle.slice(1)}
Amount: ₹${(paymentData.amount / 100).toLocaleString()}

Total Amount: ₹${(paymentData.amount / 100).toLocaleString()}

Payment Status: PAID

Thank you for choosing EchoAid!
This is a computer-generated invoice and does not require a signature.
  `.trim();

  const fileName = `invoice_${paymentData.orderId}_${Date.now()}.txt`;
  const buffer = Buffer.from(invoiceContent, 'utf8');

  return {
    buffer: buffer,
    fileName: fileName
  };
};

export const generateReceiptPDF = (paymentData, userData) => {
  // Simple text-based receipt generation for now
  const receiptContent = `
PAYMENT RECEIPT
===============

Receipt #: ${paymentData.paymentId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Details:
----------------
Name: ${userData.name || 'User'}
Email: ${userData.email}

Payment Details:
---------------
Plan: ${paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)}
Billing Cycle: ${paymentData.billingCycle.charAt(0).toUpperCase() + paymentData.billingCycle.slice(1)}
Amount: ₹${(paymentData.amount / 100).toLocaleString()}
Payment Method: Razorpay
Transaction ID: ${paymentData.paymentId}

✓ PAYMENT SUCCESSFUL
Your subscription has been activated successfully!

Thank you for choosing EchoAid!
This is a computer-generated receipt.
  `.trim();

  const fileName = `receipt_${paymentData.paymentId}_${Date.now()}.txt`;
  const buffer = Buffer.from(receiptContent, 'utf8');

  return {
    buffer: buffer,
    fileName: fileName
  };
};

export const generateCertificatePDF = (userData, courseName, certificateCode) => {
  return new Promise((resolve, reject) => {
    try {
      // Lazy load PDFDocument to avoid issues if not installed
      import('pdfkit').then(({ default: PDFDocument }) => {
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4', // 841.89 x 595.28 points
          margin: 0,
          info: {
            Title: 'Certificate of Completion',
            Author: 'EchoAid Learning Platform'
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({
            buffer: pdfBuffer,
            fileName: `Certificate-${(userData.recipientName || userData.name || 'User').replace(/\s+/g, '_')}-${Date.now()}.pdf`
          });
        });

        // --- BACKGROUND ---
        // Light cream/off-white background for paper feel
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFCF5');

        // --- BORDERS ---
        // Outer Dark Border
        doc.lineWidth(3).strokeColor('#1E3A8A'); // Dark Blue
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

        // Inner Ornamental Border Style (Double line)
        doc.lineWidth(1).strokeColor('#D97706'); // Amber/Gold
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
        doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

        // --- CORNER DECORATIONS (Simple Triangles) ---
        doc.fillColor('#1E3A8A');
        // Top-Left
        doc.path('M 20 20 L 100 20 L 20 100 z').fill();
        // Top-Right
        doc.path(`M ${doc.page.width - 20} 20 L ${doc.page.width - 100} 20 L ${doc.page.width - 20} 100 z`).fill();
        // Bottom-Left
        doc.path(`M 20 ${doc.page.height - 20} L 100 ${doc.page.height - 20} L 20 ${doc.page.height - 100} z`).fill();
        // Bottom-Right
        doc.path(`M ${doc.page.width - 20} ${doc.page.height - 20} L ${doc.page.width - 100} ${doc.page.height - 20} L ${doc.page.width - 20} ${doc.page.height - 100} z`).fill();


        // --- HEADER LOGO TEXT ---
        doc.moveDown(2);
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#1E3A8A')
          .text('EchoAid', { align: 'center' });

        doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
          .text('The Platform for Inclusive Communication', { align: 'center', characterSpacing: 2 });

        // --- TITLE ---
        doc.moveDown(3);
        doc.fontSize(42).font('Times-Bold').fillColor('#111827') // Times font works better for certs
          .text('CERTIFICATE OF COMPLETION', { align: 'center', characterSpacing: 1 });

        // --- SEPARATOR LINE ---
        const pageWidth = doc.page.width;
        doc.moveTo(pageWidth / 2 - 100, doc.y + 10)
          .lineTo(pageWidth / 2 + 100, doc.y + 10)
          .lineWidth(2).strokeColor('#D97706').stroke();


        // --- RECIPIENT ---
        doc.moveDown(2);
        doc.fontSize(16).font('Helvetica').fillColor('#4B5563')
          .text('Thinking proudly presented to', { align: 'center' });

        doc.moveDown(1);
        // Fallback Strategy for Name
        const nameToPrint = userData.recipientName || userData.name || userData.username || 'Valued Learner';

        doc.fontSize(40).font('Times-Bold').fillColor('#1E3A8A')
          .text(nameToPrint.toUpperCase(), { align: 'center' });

        // Underline Name
        doc.lineWidth(1).strokeColor('#1E3A8A')
          .moveTo(pageWidth / 2 - 200, doc.y)
          .lineTo(pageWidth / 2 + 200, doc.y)
          .stroke();

        // --- COURSE ---
        doc.moveDown(1.5);
        doc.fontSize(16).font('Helvetica').fillColor('#4B5563')
          .text('For successfully completing the extensive curriculum for', { align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(28).font('Helvetica-Bold').fillColor('#000000')
          .text(courseName, { align: 'center' });

        // --- FOOTER DETAILS ---
        const footerY = doc.page.height - 120;

        // Date
        doc.fontSize(12).font('Helvetica').fillColor('#374151')
          .text('Date Issued', 100, footerY);
        doc.fontSize(14).font('Helvetica-Bold')
          .text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 100, footerY + 20);

        // Signature Line
        doc.lineWidth(1).strokeColor('#374151')
          .moveTo(100, footerY + 40).lineTo(250, footerY + 40).stroke();


        // Certificate ID (Right side)
        const certId = certificateCode || `EA-${Date.now().toString(36).toUpperCase()}`;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#374151')
          .text('Certificate ID', pageWidth - 250, footerY, { width: 150, align: 'right' });
        doc.fontSize(10).font('Courier').fillColor('#6B7280') // Monospace for ID
          .text(certId, pageWidth - 250, footerY + 20, { width: 150, align: 'right' });


        // --- CENTER BADGE (Simulated) ---
        // Draw a gold seal at the bottom center
        const centerX = pageWidth / 2;
        const sealY = footerY + 10;

        doc.circle(centerX, sealY, 40).fillColor('#D97706').fill(); // Outer Gold
        doc.circle(centerX, sealY, 35).fillColor('#F59E0B').fill(); // Inner Amber

        // "Star" in center (simple triangle/shape)
        doc.fillColor('#FFFFFF');
        doc.fontSize(20).text('★', centerX - 8, sealY - 8);
        doc.fontSize(8).font('Helvetica-Bold').text('VERIFIED', centerX - 18, sealY + 15);

        // Finalize
        doc.end();

      }).catch(err => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};