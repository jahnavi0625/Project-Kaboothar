const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for main website content
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/send-email', upload.single('attachments'), async (req, res) => {
    const { to, cc, subject, message } = req.body;
    console.log('req.body', req.body);
    console.log('req.file', req.file);

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
        console.log('info', info);
        res.status(200).json({
            message: 'Email sent successfully',
            info
        });
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            message: 'Error sending email',
            error: error.message
        });
    }
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
