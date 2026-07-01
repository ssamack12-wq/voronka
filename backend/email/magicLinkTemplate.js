const APP_NAME = process.env.RESEND_APP_NAME || 'Навигатор сделки';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMagicLinkEmail({ verifyUrl, email }) {
  const safeUrl = escapeHtml(verifyUrl);
  const safeEmail = escapeHtml(email);

  const subject = `Вход в ${APP_NAME}`;

  const text = [
    `Вход в ${APP_NAME}`,
    '',
    `Здравствуйте!`,
    '',
    `Перейдите по ссылке, чтобы продолжить сделку (действует 15 минут):`,
    verifyUrl,
    '',
    `Если вы не запрашивали вход, просто проигнорируйте это письмо.`,
    '',
    `— ${APP_NAME}`
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #f3f4f6;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:12px;font-weight:600;color:#2563eb;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(APP_NAME)}</p>
              <h1 style="margin:12px 0 0;font-size:22px;font-weight:600;color:#1f2937;line-height:1.3;">Войдите в навигатор</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#6b7280;">
                Ссылка для входа на <span style="color:#1f2937;font-weight:500;">${safeEmail}</span>.
                Пароль не нужен.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <a href="${safeUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;">
                Продолжить сделку
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#9ca3af;">
                Ссылка действует 15 минут. Если кнопка не открывается, скопируйте адрес:
              </p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.5;word-break:break-all;">
                <a href="${safeUrl}" style="color:#2563eb;">${safeUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                Не запрашивали вход? Проигнорируйте письмо — доступ никому не будет предоставлен.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

module.exports = { buildMagicLinkEmail, APP_NAME };
