const express = require('express');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const upload = multer();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email
app.post('/send', upload.none(), async (req, res) => {
  const { to, subject, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Save sent email to sentEmails.json
    const sentEmailsPath = path.join(__dirname, 'data', 'sentEmails.json');
    let sentEmails = [];

    if (fs.existsSync(sentEmailsPath)) {
      sentEmails = JSON.parse(fs.readFileSync(sentEmailsPath));
    }

    sentEmails.push({
      to,
      subject,
      message,
      date: new Date().toISOString(),
    });

    fs.writeFileSync(sentEmailsPath, JSON.stringify(sentEmails, null, 2));
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// Get sent emails
app.get('/sent', (req, res) => {
  const sentEmailsPath = path.join(__dirname, 'data', 'sentEmails.json');
  if (!fs.existsSync(sentEmailsPath)) {
    return res.json([]);
  }
  const sentEmails = JSON.parse(fs.readFileSync(sentEmailsPath));
  res.json(sentEmails);
});

// Get received emails (Mock - since Gmail/Nodemailer can’t fetch inbox)
app.get('/received', (req, res) => {
  const receivedPath = path.join(__dirname, 'data', 'receivedEmails.json');
  if (!fs.existsSync(receivedPath)) {
    return res.json([]);
  }
  const receivedEmails = JSON.parse(fs.readFileSync(receivedPath));
  res.json(receivedEmails);
});

// Add to address book
app.post('/address-book', (req, res) => {
  const { name, email } = req.body;
  const addressBookPath = path.join(__dirname, 'data', 'addressBook.json');
  let contacts = [];

  if (fs.existsSync(addressBookPath)) {
    contacts = JSON.parse(fs.readFileSync(addressBookPath));
  }

  contacts.push({ name, email });
  fs.writeFileSync(addressBookPath, JSON.stringify(contacts, null, 2));
  res.json({ message: 'Contact added successfully.' });
});

// Get address book
app.get('/address-book', (req, res) => {
  const addressBookPath = path.join(__dirname, 'data', 'addressBook.json');
  if (!fs.existsSync(addressBookPath)) {
    return res.json([]);
  }
  const contacts = JSON.parse(fs.readFileSync(addressBookPath));
  res.json(contacts);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
