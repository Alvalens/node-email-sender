const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const fs = require('fs');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailHtml = fs.readFileSync('email-template.html', 'utf8');

const sendEmail = (to) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'Masukan Anda Penting Bagi Kami | intervyou.me',
    html: emailHtml,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Error sending to ${to}: ${error}`);
    }
    console.log(`Email sent to ${to}: ${info.response}`);
  });
};

const arg = process.argv[2];

if (arg === 'test') {
  console.log('Sending test email...');
  sendEmail('alvalen.shafel04@gmail.com');
} else {
  fs.createReadStream('data/email.csv')
    .pipe(csv())
    .on('data', (row) => {
      sendEmail(row.email);
    })
    .on('end', () => {
      console.log('CSV file successfully processed.');
    });
}