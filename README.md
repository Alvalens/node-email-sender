# Email Sender

This script sends a survey email to a list of recipients from a CSV file.

## Installation

1. Clone the repository or download the files.
2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file by copying the example:

   ```bash
   copy .env.example .env
   ```
2. Open the `.env` file and add your SMTP credentials.

   - `SMTP_HOST`: Your SMTP server host.
   - `SMTP_FROM`: The email address you are sending from.
   - `SMTP_PORT`: The port for your SMTP server.
   - `SMTP_SECURE`: Use `true` for SSL/TLS, otherwise `false`.
   - `SMTP_USER`: Your SMTP username.
   - `SMTP_PASS`: Your SMTP password or API key.
3. Add your recipient emails to `data/email.csv`. The file must contain a header row with an "email" and "name" column.

## Usage

To run the script, use the `npm start` command.

### Batch Sending

You can send emails in batches by providing a range as a command-line argument. For example, to send to the first 500 emails in your CSV:

```bash
node send-survey.js 1-500
```

To send the next batch:

```bash
node send-survey.js 501-1000
```

### Test Email

To send a single test email to `alvalen.shafel04@gmail.com`, run:

```bash
node send-survey.js test
```

### Preview

To preview the email template, run:

```bash
npm run preview
```

This will generate a `preview.html` file that you can open in your browser.
