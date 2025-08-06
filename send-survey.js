const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const csv = require("csv-parser");
const fs = require("fs");
const util = require("util");

dotenv.config();

// Add validation for required environment variables
const requiredEnvVars = [
	"SMTP_HOST",
	"SMTP_PORT",
	"SMTP_USER",
	"SMTP_PASS",
	"SMTP_FROM",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
	console.error(
		`Error: Missing required environment variables: ${missingEnvVars.join(
			", "
		)}`
	);
	process.exit(1);
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

// Verify SMTP connection
transporter.verify((error) => {
	if (error) {
		console.error("SMTP connection error:", error);
		process.exit(1);
	} else {
		console.log("SMTP server is ready to send emails");
	}
});

// Convert sendMail to Promise-based for better error handling
const sendMailAsync = util.promisify(transporter.sendMail.bind(transporter));

// Load email template with error handling
let emailTemplate;
try {
	emailTemplate = fs.readFileSync("email-template.html", "utf8");
} catch (error) {
	console.error(`Error loading email template: ${error.message}`);
	process.exit(1);
}

// Stats tracking
const stats = {
	total: 0,
	successful: 0,
	failed: 0,
	errors: [],
};

const sendEmail = async (to, name) => {
	stats.total++;
	const emailHtml = emailTemplate.replace("{{name}}", name);
	const mailOptions = {
		from: process.env.SMTP_FROM,
		to: to,
		subject: "Masukan Anda Penting Bagi Kami | intervyou.me",
		html: emailHtml,
	};

	try {
		const info = await sendMailAsync(mailOptions);
		console.log(`Email sent to ${to}: ${info.response}`);
		stats.successful++;
		return true;
	} catch (error) {
		console.error(`Error sending to ${to}: ${error.message}`);
		stats.failed++;
		stats.errors.push({ email: to, error: error.message });
		return false;
	}
};

const arg = process.argv[2];

const printStats = () => {
	console.log("\n=== Email Sending Statistics ===");
	console.log(`Total emails processed: ${stats.total}`);
	console.log(`Successfully sent: ${stats.successful}`);
	console.log(`Failed to send: ${stats.failed}`);

	if (stats.failed > 0) {
		console.log("\nFailed emails:");
		stats.errors.forEach((error, index) => {
			console.log(`${index + 1}. ${error.email}: ${error.error}`);
		});
	}

	console.log(
		"\nSuccess rate: " +
			((stats.successful / stats.total) * 100).toFixed(2) +
			"%"
	);
};

if (arg === "test") {
	console.log("Sending test email...");
	sendEmail("alvalen.shafel04@gmail.com", "Alvalen").then(() => printStats());
} else {
	const [start, end] = (arg || "").split("-").map(Number);

	const emails = [];
	fs.createReadStream("data/email-new.csv")
		.pipe(csv())
		.on("data", (row) => {
			emails.push(row);
		})
		.on("error", (error) => {
			console.error(`Error reading CSV file: ${error.message}`);
			process.exit(1);
		})
		.on("end", async () => {
			const toSend = start && end ? emails.slice(start - 1, end) : emails;

			if (toSend.length === 0) {
				console.warn(
					"No emails to send. Check your CSV file or start-end range."
				);
				process.exit(0);
			}

			console.log(`Preparing to send ${toSend.length} emails...`);

			// Use Promise.all to send emails in parallel but with a limit
			const batchSize = 10; // Adjust based on your SMTP server's rate limits
			for (let i = 0; i < toSend.length; i += batchSize) {
				const batch = toSend.slice(i, i + batchSize);
				await Promise.all(
					batch.map((row) => sendEmail(row.email, row.name))
				);
				console.log(
					`Processed batch ${
						Math.floor(i / batchSize) + 1
					}/${Math.ceil(toSend.length / batchSize)}`
				);
			}

			printStats();
			console.log("CSV file successfully processed.");
		});
}
