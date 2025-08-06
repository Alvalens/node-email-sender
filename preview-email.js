const fs = require('fs');

console.log('Generating email preview...');

const emailHtml = fs.readFileSync('email-template.html', 'utf8');
fs.writeFileSync('preview.html', emailHtml);

console.log('Preview generated: preview.html');
console.log('Open preview.html in your browser to see the email template.');
