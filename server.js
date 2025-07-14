require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Submission = require('./models/Submission');

const app = express();
app.use(express.json());

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

  // Save to database
  const newSubmission = new Submission({
    formType: 'Contact Form',
    formData: { name, email, subject, message },
  });
  await newSubmission.save();

  // Send email
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

  try {
    await transporter.sendMail(mailOptions);

    // Admin email for Contact Form
    const adminEmailBody = `
      <p>New Contact Form Submission:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
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

    res.status(200).send('Contact form submitted and email sent successfully!');
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).send('Error submitting contact form or sending email.');
  }
});

// Route for Application Form
app.post('/submit-application', async (req, res) => {
  const { firstname, lastname, program, parent_name, number, email, address, dob, gender, agree } = req.body;

  // Save to database
  const newSubmission = new Submission({
    formType: 'Application Form',
    formData: { firstname, lastname, program, parent_name, number, email, address, dob, gender, agree },
  });
  await newSubmission.save();

  // Send email
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

  try {
    await transporter.sendMail(mailOptions);

    // Admin email for Application Form
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

    res.status(200).send('Application form submitted and email sent successfully!');
  } catch (error) {
    console.error('Error sending application email:', error);
    res.status(500).send('Error submitting application form or sending email.');
  }
});

// Route for Newsletter Subscription Form
app.post('/subscribe-newsletter', async (req, res) => {
  const { newsletter_email } = req.body;

  // Save to database
  const newSubmission = new Submission({
    formType: 'Newsletter Subscription',
    formData: { newsletter_email },
  });
  await newSubmission.save();

  // Send email
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

  try {
    await transporter.sendMail(mailOptions);

    // Admin email for Newsletter Subscription
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

    res.status(200).send('Newsletter subscription successful and confirmation email sent!');
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    res.status(500).send('Error subscribing to newsletter or sending email.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
