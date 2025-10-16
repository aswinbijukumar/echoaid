import { jsPDF } from 'jspdf';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateInvoicePDF = (paymentData, userData) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Colors
  const primaryColor = [0, 204, 0]; // #00CC00
  const darkColor = [35, 39, 47]; // #23272F
  const lightGray = [107, 114, 128]; // #6B7280
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EchoAid', 20, 20);
  
  // Invoice title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text(`Invoice #: ${paymentData.orderId}`, 150, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 35);
  doc.text(`Payment ID: ${paymentData.paymentId}`, 150, 40);
  
  // Customer details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(userData.name || 'User', 20, 60);
  doc.text(userData.email, 20, 65);
  
  // Plan details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Subscription Details:', 20, 85);
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 95, 170, 10, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, 102);
  doc.text('Plan', 100, 102);
  doc.text('Billing Cycle', 130, 102);
  doc.text('Amount', 160, 102);
  
  // Table content
  doc.setFont('helvetica', 'normal');
  doc.text(`${paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)} Subscription`, 25, 112);
  doc.text(paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1), 100, 112);
  doc.text(paymentData.billingCycle.charAt(0).toUpperCase() + paymentData.billingCycle.slice(1), 130, 112);
  doc.text(`₹${(paymentData.amount / 100).toLocaleString()}`, 160, 112);
  
  // Total
  doc.setFillColor(...primaryColor);
  doc.rect(120, 125, 70, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount:', 125, 135);
  doc.text(`₹${(paymentData.amount / 100).toLocaleString()}`, 160, 135);
  
  // Payment status
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Payment Status:', 20, 155);
  
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(20, 160, 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('PAID', 30, 166);
  
  // Footer
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for choosing EchoAid!', 20, 280);
  doc.text('This is a computer-generated invoice and does not require a signature.', 20, 285);
  
  // Save the PDF
  const fileName = `invoice_${paymentData.orderId}_${Date.now()}.pdf`;
  const pdfBuffer = doc.output('arraybuffer');
  
  return {
    buffer: pdfBuffer,
    fileName: fileName
  };
};

export const generateReceiptPDF = (paymentData, userData) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Colors
  const primaryColor = [0, 204, 0]; // #00CC00
  const darkColor = [35, 39, 47]; // #23272F
  const lightGray = [107, 114, 128]; // #6B7280
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EchoAid', 20, 20);
  
  // Receipt title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 120, 20);
  
  // Receipt details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text(`Receipt #: ${paymentData.paymentId}`, 120, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 35);
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 120, 40);
  
  // Customer details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details:', 20, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${userData.name || 'User'}`, 20, 60);
  doc.text(`Email: ${userData.email}`, 20, 65);
  
  // Payment details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Payment Details:', 20, 85);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Plan: ${paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)}`, 20, 95);
  doc.text(`Billing Cycle: ${paymentData.billingCycle.charAt(0).toUpperCase() + paymentData.billingCycle.slice(1)}`, 20, 100);
  doc.text(`Amount: ₹${(paymentData.amount / 100).toLocaleString()}`, 20, 105);
  doc.text(`Payment Method: Razorpay`, 20, 110);
  doc.text(`Transaction ID: ${paymentData.paymentId}`, 20, 115);
  
  // Success message
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(20, 130, 170, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('✓ PAYMENT SUCCESSFUL', 30, 142);
  
  doc.setFontSize(10);
  doc.text('Your subscription has been activated successfully!', 30, 150);
  
  // Footer
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for choosing EchoAid!', 20, 280);
  doc.text('This is a computer-generated receipt.', 20, 285);
  
  // Save the PDF
  const fileName = `receipt_${paymentData.paymentId}_${Date.now()}.pdf`;
  const pdfBuffer = doc.output('arraybuffer');
  
  return {
    buffer: pdfBuffer,
    fileName: fileName
  };
};