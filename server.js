const express = require('express');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Configure multer for handling multiple attachments in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// SEND EMAIL (multiple recipients + multiple attachments)
app.post('/send', upload.array("attachments"), async (req, res) => {
  const { to, cc, subject, message } = req.body;

  const toList = to.split(',').map(e => e.trim()).filter(Boolean);
  const ccList = cc ? cc.split(',').map(e => e.trim()).filter(Boolean) : [];

  const attachments = req.files?.map(file => ({
    filename: file.originalname,
    content: file.buffer
  })) || [];

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toList,
    cc: ccList,
    subject,
    text: message,
    html: `<p>${message}</p>`,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);

    const sentPath = path.join(__dirname, 'data', 'sentEmails.json');
    let sent = fs.existsSync(sentPath) ? JSON.parse(fs.readFileSync(sentPath)) : [];

    sent.push({
      to: toList,
      cc: ccList,
      subject,
      message,
      attachments: attachments.map(a => a.filename),
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(sentPath, JSON.stringify(sent, null, 2));
    res.json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// GET sent emails
app.get('/sent', (req, res) => {
  const sentPath = path.join(__dirname, 'data', 'sentEmails.json');
  if (!fs.existsSync(sentPath)) return res.json([]);
  const sentEmails = JSON.parse(fs.readFileSync(sentPath));
  res.json(sentEmails);
});

// GET received emails (mock)
app.get('/received', (req, res) => {
  const receivedPath = path.join(__dirname, 'data', 'receivedEmails.json');
  if (!fs.existsSync(receivedPath)) return res.json([]);
  const receivedEmails = JSON.parse(fs.readFileSync(receivedPath));

  receivedEmails.forEach(email => {
    if (!email.timestamp) {
      email.timestamp = new Date().toISOString();
    }
  });

  res.json(receivedEmails);
});

// Add to address book
app.post('/address-book', (req, res) => {
  const { name, email } = req.body;
  const file = path.join(__dirname, 'data', 'addressBook.json');
  let book = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  book.push({ name, email });
  fs.writeFileSync(file, JSON.stringify(book, null, 2));
  res.json({ message: 'Contact added successfully.' });
});

// GET address book
app.get('/address-book', (req, res) => {
  const file = path.join(__dirname, 'data', 'addressBook.json');
  if (!fs.existsSync(file)) return res.json([]);
  const book = JSON.parse(fs.readFileSync(file));
  res.json(book);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
