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

const emailTemplate = fs.readFileSync('email-template.html', 'utf8');

const sendEmail = (to, name) => {
  const emailHtml = emailTemplate.replace('{{name}}', name);
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

const [start, end] = (process.argv[2] || '').split('-').map(Number);

const emails = [];
fs.createReadStream('data/email-new.csv')
  .pipe(csv())
  .on('data', (row) => {
    emails.push(row);
  })
  .on('end', () => {
    const toSend = (start && end) ? emails.slice(start - 1, end) : emails;
    
    toSend.forEach(row => {
      sendEmail(row.email, row.name);
    });

    console.log('CSV file successfully processed.');
  });
