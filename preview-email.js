const fs = require('fs');

console.log('Generating email preview...');

const emailTemplate = fs.readFileSync('email-template.html', 'utf8');
const emailHtml = emailTemplate.replace('{{name}}', 'John Doe');
fs.writeFileSync('preview.html', emailHtml);

console.log('Preview generated: preview.html');
console.log('Open preview.html in your browser to see the email template.');