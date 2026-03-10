require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Submission = require('./models/Submission');
const Waitlist = require('./models/Waitlist');

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://cyan.university'
  ],
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to read email template parts
const getEmailTemplate = (bodyContent) => {
  const header = fs.readFileSync(path.join(__dirname, 'templates', 'header.html'), 'utf8');
  const footer = fs.readFileSync(path.join(__dirname, 'templates', 'footer.html'), 'utf8');
  return header + bodyContent + footer;
};

// Route for Contact Form
app.post('/submit-contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log('Received contact form submission:', { name, email, subject });

  try {
    // Save to database
    console.log('Attempting to save contact form submission to database...');
    const newSubmission = new Submission({
      formType: 'Contact Form',
      formData: { name, email, subject, message },
    });
    await newSubmission.save();
    console.log('Contact form submission saved to database.');

    // Send confirmation email to recipient
    console.log('Attempting to send confirmation email to recipient...');
    const emailBody = `
      <p>Dear ${name},</p>
      <p>Thank you for contacting us. We have received your message and will get back to you shortly.</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Contact Form Submission: ${subject}`,
      html: getEmailTemplate(emailBody),
    };
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to recipient successfully.');

    // Send admin notification email
    console.log('Attempting to send admin notification email...');
    const adminEmailBody = `
      <p>New Contact Form Submission:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</b> ${email}</li>
        <li><strong>Subject:</strong> ${subject}</li>
        <li><strong>Message:</strong> ${message}</li>
      </ul>
    `;
    const mailOptionsAdmin = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `ADMIN: New Contact Form Submission - ${subject}`,
      html: getEmailTemplate(adminEmailBody),
    };
    await transporter.sendMail(mailOptionsAdmin);
    console.log('Admin notification email sent successfully.');

    res.status(200).send('Contact form submitted and email sent successfully!');
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).send('Error submitting contact form or sending email.');
  }
});

// Route for Application Form
app.post('/submit-application', async (req, res) => {
  const { firstname, lastname, program, parent_name, number, email, address, dob, gender, agree } = req.body;
  console.log('Received application form submission:', { firstname, lastname, program });

  try {
    // Save to database
    console.log('Attempting to save application form submission to database...');
    const newSubmission = new Submission({
      formType: 'Application Form',
      formData: { firstname, lastname, program, parent_name, number, email, address, dob, gender, agree },
    });
    await newSubmission.save();
    console.log('Application form submission saved to database.');

    // Send confirmation email to recipient
    console.log('Attempting to send confirmation email to recipient...');
    const emailBody = `
      <p>Dear ${parent_name},</p>
      <p>Thank you for submitting the application for ${firstname} ${lastname}. We have received your application and will review it soon.</p>
      <p><strong>Program:</strong> ${program}</p>
      <p><strong>Child's Name:</strong> ${firstname} ${lastname}</p>
      <p><strong>Parent's Contact:</strong> ${number}</p>
      <p><strong>Parent's Email:</strong> ${email}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Date of Birth:</strong> ${dob}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Agreed to Terms:</strong> ${agree ? 'Yes' : 'No'}</p>
    `;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Application Form Submission for ${firstname} ${lastname}`,
      html: getEmailTemplate(emailBody),
    };
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to recipient successfully.');

    // Admin email for Application Form
    console.log('Attempting to send admin notification email...');
    const adminEmailBody = `
      <p>New Application Form Submission:</p>
      <ul>
        <li><strong>Child's Name:</strong> ${firstname} ${lastname}</li>
        <li><strong>Program:</strong> ${program}</li>
        <li><strong>Parent's Name:</strong> ${parent_name}</li>
        <li><strong>Parent's Contact:</strong> ${number}</li>
        <li><strong>Parent's Email:</strong> ${email}</li>
        <li><strong>Address:</strong> ${address}</li>
        <li><strong>Date of Birth:</strong> ${dob}</li>
        <li><strong>Gender:</strong> ${gender}</li>
        <li><strong>Agreed to Terms:</strong> ${agree ? 'Yes' : 'No'}</li>
      </ul>
    `;
    const mailOptionsAdmin = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `ADMIN: New Application Form Submission for ${firstname} ${lastname}`,
      html: getEmailTemplate(adminEmailBody),
    };
    await transporter.sendMail(mailOptionsAdmin);
    console.log('Admin notification email sent successfully.');

    res.status(200).send('Application form submitted and email sent successfully!');
  } catch (error) {
    console.error('Error processing application form:', error);
    res.status(500).send('Error submitting application form or sending email.');
  }
});

// Route for Cyan Open University of Technology Waitlist
app.post('/waitlist', async (req, res) => {
  const { fullname, email } = req.body;
  console.log('Received waitlist submission:', { fullname, email });

  try {
    // Validate input
    if (!fullname || !email) {
      return res.status(400).send('Full name and email are required.');
    }

    // Save to database
    console.log('Attempting to save waitlist submission to database...');
    const newWaitlist = new Waitlist({
      fullname,
      email,
    });
    await newWaitlist.save();
    console.log('Waitlist submission saved to database.');

    // Send confirmation email to recipient
    console.log('Attempting to send confirmation email to recipient...');
    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Our Waitlist!</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="color: #333333; font-size: 18px; margin-bottom: 20px;">Dear ${fullname},</p>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in <strong>Cyan Open University of Technology</strong>! We are thrilled to have you join our waitlist.
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 5px;">
            <p style="color: #333333; font-size: 15px; margin: 0; line-height: 1.6;">
              <strong>✓ Your submission has been received successfully!</strong><br>
              We've added you to our exclusive waitlist and will keep you updated on our launch progress.
            </p>
          </div>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            As a waitlist member, you'll be among the first to know when we open our doors. We'll send you updates about:
          </p>
          
          <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin-bottom: 30px;">
            <li>Early access opportunities</li>
            <li>Special launch offers and benefits</li>
            <li>Program details and course information</li>
            <li>Important dates and milestones</li>
          </ul>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're working hard to create an exceptional learning experience, and we can't wait to share it with you.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <p style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0;">
              Stay tuned for exciting updates!
            </p>
          </div>
          
          <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 10px;">
            Warm regards,<br>
            <strong style="color: #667eea;">The Cyan Open University of Technology Team</strong>
          </p>
        </div>
      </div>
    `;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Cyan Open University of Technology Waitlist! 🎓',
      html: getEmailTemplate(emailBody),
    };
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to recipient successfully.');

    res.status(200).send('Waitlist submission successful and confirmation email sent!');
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    res.status(500).send('Error submitting to waitlist or sending email.');
  }
});

// Route for Newsletter Subscription Form
app.post('/subscribe-newsletter', async (req, res) => {
  const { newsletter_email } = req.body;
  console.log('Received newsletter subscription:', { newsletter_email });

  try {
    // Save to database
    console.log('Attempting to save newsletter subscription to database...');
    const newSubmission = new Submission({
      formType: 'Newsletter Subscription',
      formData: { newsletter_email },
    });
    await newSubmission.save();
    console.log('Newsletter subscription saved to database.');

    // Send confirmation email to recipient
    console.log('Attempting to send confirmation email to recipient...');
    const emailBody = `
      <p>Dear Subscriber,</p>
      <p>Thank you for subscribing to our newsletter! You will now receive updates from us.</p>
      <p><strong>Email:</strong> ${newsletter_email}</p>
    `;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: newsletter_email,
      subject: 'Newsletter Subscription Confirmation',
      html: getEmailTemplate(emailBody),
    };
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to recipient successfully.');

    // Admin email for Newsletter Subscription
    console.log('Attempting to send admin notification email...');
    const adminEmailBody = `
      <p>New Newsletter Subscription:</p>
      <ul>
        <li><strong>Email:</strong> ${newsletter_email}</li>
      </ul>
    `;
    const mailOptionsAdmin = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `ADMIN: New Newsletter Subscription - ${newsletter_email}`,
      html: getEmailTemplate(adminEmailBody),
    };
    await transporter.sendMail(mailOptionsAdmin);
    console.log('Admin notification email sent successfully.');

    res.status(200).send('Newsletter subscription successful and confirmation email sent!');
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    res.status(500).send('Error subscribing to newsletter or sending email.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
