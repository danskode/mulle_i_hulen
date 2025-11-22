import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Opret emails mappe hvis den ikke findes
const emailsDir = path.join(__dirname, '../emails');
if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
}

// Initialiser Resend hvis API key er tilgængelig
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Tilladt email for Resend (kun verificerede emails)
const ALLOWED_RESEND_EMAIL = process.env.RESEND_ALLOWED_EMAIL || null;

/**
 * Email service med Resend integration
 * - Hvis RESEND_API_KEY er sat: sender rigtige emails via Resend (kun til godkendte adresser)
 * - Hvis ingen API key: fallback til file logging (development mode)
 * - Logger altid til console
 */
class EmailService {
    async sendEmail({ to, subject, text, html }) {
        const email = {
            to,
            subject,
            text,
            html: html || text,
            sentAt: new Date().toISOString()
        };

        // Log altid til console
        console.log('\n📧 EMAIL SENDT:');
        console.log('━'.repeat(50));
        console.log(`Mode: ${resend ? 'Resend (Production)' : 'File Logging (Development)'}`);
        console.log(`Til: ${to}`);
        console.log(`Emne: ${subject}`);
        console.log('Indhold:');
        console.log(text);
        console.log('━'.repeat(50) + '\n');

        // Send via Resend hvis API key er tilgængelig
        if (resend) {
            // Tjek om RESEND_ALLOWED_EMAIL er konfigureret
            if (!ALLOWED_RESEND_EMAIL) {
                console.log('⚠️  RESEND_ALLOWED_EMAIL er ikke konfigureret i .env');
                console.log('   Falder tilbage til file logging...');
                // Fortsæt til fallback (file logging)
            } else {
                // Tjek om modtagerens email er godkendt til Resend
                const isAllowedEmail = to === ALLOWED_RESEND_EMAIL;

                if (!isAllowedEmail) {
                    console.log(`⚠️  Email til ${to} er ikke godkendt for Resend.`);
                    console.log(`   Kun ${ALLOWED_RESEND_EMAIL} er tilladt i free tier.`);
                    console.log('   Falder tilbage til file logging...');
                    // Fortsæt til fallback (file logging)
                } else {
                try {
                    const { data, error } = await resend.emails.send({
                        from: 'Zappa Klubben <onboarding@resend.dev>', // Brug din verificerede domain
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
                    // Fallback til file logging hvis Resend fejler
                    console.log('⚠️  Falder tilbage til file logging...');
                }
                }
            }
        }

        // Fallback: Gem til fil (development mode eller hvis Resend fejler)
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

    async sendWelcomeEmail(username, email) {
        return this.sendEmail({
            to: email,
            subject: `Velkommen til klubben, ${username}!`,
            text: `
Hej ${username}!

Velkommen til det hemmelige selskab omkring Zappa! 🎸

Dette er din første login, og vi er glade for at have dig med.

Du kan nu få adgang til eksklusivt indhold og se vores medlemmer.

Med venlig hilsen,
Zappa Klubben
            `.trim()
        });
    }
}

export default new EmailService();
