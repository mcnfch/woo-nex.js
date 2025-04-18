import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: 'mail.festivalravegear.com',
  port: 465, // Secure SMTP port from the config file
  secure: true, // true for 465 port as specified in the config
  auth: {
    user: 'support@groovygallerydesigns.com',
    pass: 'way2mcnfch!QAZ'
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const { name, email, subject, message } = data;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Define email options
    const mailOptions = {
      from: `"Groovy Gallery Designs" <support@groovygallerydesigns.com>`,
      to: 'support@groovygallerydesigns.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6b46c1;">New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <div style="margin-top: 20px;">
    <p><strong>Message:</strong></p>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6b46c1;">
      ${message.replace(/\n/g, '<br>')}
    </div>
  </div>
</div>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }
}
