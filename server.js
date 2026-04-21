require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be a Gmail App Password
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Nodemailer verification error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  const mailOptions = {
    from: `"Smart League" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
