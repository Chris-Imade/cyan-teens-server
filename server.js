require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Submission = require('./models/Submission');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
