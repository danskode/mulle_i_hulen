//==== Plain text version for email clients ====//

export function getPasswordResetText(username, resetLink) {
    return `
Hej ${username}!

Du har anmodet om at nulstille dit password.

Klik på linket nedenfor for at nulstille dit password:
${resetLink}

Linket udløber om 1 time.

Hvis du ikke har anmodet om dette, kan du ignorere denne email.

Med venlig hilsen
Zappas hule
    `.trim();
}

//==== HTML version with styled button for email clients ====//

export function getPasswordResetHtml(username, resetLink) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Hej ${username}!</h2>

        <p>Du har anmodet om at nulstille dit password.</p>

        <p>Klik på knappen nedenfor for at nulstille dit password:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #3498db;
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;">
                Nulstil Password
            </a>
        </div>

        <p style="color: #7f8c8d; font-size: 14px;">
            Eller kopier dette link til din browser:<br>
            <a href="${resetLink}" style="color: #3498db;">${resetLink}</a>
        </p>

        <p style="color: #e74c3c; font-weight: bold;">Linket udløber om 1 time.</p>

        <p>Hvis du ikke har anmodet om dette, kan du ignorere denne email.</p>

        <p style="margin-top: 30px;">
            Med venlig hilsen<br>
            <strong>Zappas hule</strong>
        </p>
    </div>
</body>
</html>
    `.trim();
}