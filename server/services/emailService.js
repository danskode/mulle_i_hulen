import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resend } from 'resend';
import { getPasswordResetText, getPasswordResetHtml } from './templates/passwordResetEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make sure there is a folder for emails to be logged in for testing
const emailsDir = path.join(__dirname, '../emails');
if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
}

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Only one email is allowed in Resend free tier test mode
const ALLOWED_RESEND_EMAIL = process.env.RESEND_ALLOWED_EMAIL || null;

class EmailService {
    async sendEmail({ to, subject, text, html }) {
        const email = {
            to,
            subject,
            text,
            html: html || text,
            sentAt: new Date().toISOString()
        };

        // Log to console
        console.log('\n📧 EMAIL SENDT:');
        console.log('━'.repeat(50));
        console.log(`Mode: ${resend ? 'Resend (Production)' : 'File Logging (Development)'}`);
        console.log(`Til: ${to}`);
        console.log(`Emne: ${subject}`);
        console.log('Indhold:');
        console.log(text);
        console.log('━'.repeat(50) + '\n');

        // Send via Resend if API key is available
        if (resend) {
            // Check if RESEND_ALLOWED_EMAIL is configured
            if (!ALLOWED_RESEND_EMAIL) {
                console.log('⚠️  RESEND_ALLOWED_EMAIL er ikke konfigureret i .env');
                console.log('   Falder tilbage til file logging...');
                // Continue to fallback (file logging)
            } else {
                // Check if recipient email is allowed for Resend
                const isAllowedEmail = to === ALLOWED_RESEND_EMAIL;

                if (!isAllowedEmail) {
                    console.log(`⚠️  Email til ${to} er ikke godkendt for Resend.`);
                    console.log(`   Kun ${ALLOWED_RESEND_EMAIL} er tilladt i free tier.`);
                    console.log('   Falder tilbage til file logging...');
                    // Continue to fallback (file logging)
                } else {
                    try {
                        const { data, error } = await resend.emails.send({
                            from: 'Zappa Klubben <onboarding@resend.dev>',
                            to: to,
                            subject: subject,
                            text: text,
                            html: html || text.replace(/\n/g, '<br>')
                        });

                        if (error) {
                            throw error;
                        }

                        console.log('✅ Email sendt via Resend:', data.id);
                        return { success: true, messageId: data.id, mode: 'resend' };
                    } catch (error) {
                        console.error('❌ Resend fejl:', error);
                        // Fallback to file logging if Resend fails
                        console.log('⚠️  Falder tilbage til file logging...');
                    }
                }
            }
        }

        // Fallback: Save to file and print in console log (development mode or if Resend fails)
        const filename = `${Date.now()}_${to.replace('@', '_at_')}.txt`;
        const filepath = path.join(emailsDir, filename);

        const fileContent = `
===========================================
EMAIL LOG
===========================================
Til: ${to}
Emne: ${subject}
Tidspunkt: ${email.sentAt}
-------------------------------------------
${text}
===========================================
        `.trim();

        fs.writeFileSync(filepath, fileContent, 'utf8');

        return { success: true, messageId: filename, mode: 'file' };
    }

    async sendPasswordResetEmail(username, email, resetToken) {
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        return this.sendEmail({
            to: email,
            subject: 'Password Reset - Zappa Club',
            text: getPasswordResetText(username, resetLink),
            html: getPasswordResetHtml(username, resetLink)
        });
    }
}

export default new EmailService();