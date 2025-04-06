const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const upload = multer({
    dest: 'uploads/'
});

app.use(express.static(path.join(__dirname, 'Project-Kaboothar')));
app.use(express.urlencoded({
    extended: true
}));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'Project-Kaboothar')));

// Route for main website content
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Project-Kaboothar', 'home.html'));
});

app.post('/send-email', async (req, res) => {
    const {
        to,
        cc,
        subject,
        message
    } = req.body;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: to,
        cc: cc,
        subject: subject,
        text: message,
        attachments: req.file ? [{
            filename: req.file.originalname,
            path: req.file.path
        }] : []
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: 'Email sent successfully',
            info
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending email',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.get('/fetch-emails', (req, res) => {
    // Example data, replace with actual database or storage logic
    const emails = ['example1@example.com', 'example2@example.com'];
    res.json(emails);
});

app.get('/fetch-address-book', (req, res) => {
    // Example data, replace with actual database or storage logic
    const contacts = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Doe', email: 'jane@example.com' }
    ];
    res.json(contacts);
});
