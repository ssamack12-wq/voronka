/**
 * Прокси лидов в Google Apps Script (Google Sheets).
 * Ожидается doPost с JSON в e.postData.contents или form-полями.
 */

function getWebhookUrl() {
  return (process.env.GOOGLE_SCRIPT_URL || process.env.CONSULTATIONS_WEBHOOK_URL || '').trim();
}

function flattenValue(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function buildFormBody(payload) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, flattenValue(value));
  });
  return params.toString();
}

async function postToWebhook(url, payload) {
  const jsonRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  if (jsonRes.ok) {
    return { ok: true, mode: 'json' };
  }

  const jsonText = await jsonRes.text().catch(() => '');
  const formRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildFormBody(payload),
    redirect: 'follow'
  });

  if (formRes.ok) {
    return { ok: true, mode: 'form' };
  }

  const formText = await formRes.text().catch(() => '');
  throw new Error(
    `Google Sheets webhook failed (json ${jsonRes.status}: ${jsonText.slice(0, 120)}; ` +
      `form ${formRes.status}: ${formText.slice(0, 120)})`
  );
}

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string, mode?: string }>}
 */
async function forwardLeadToGoogleSheets(payload) {
  const url = getWebhookUrl();
  if (!url) {
    console.warn('[sheets] GOOGLE_SCRIPT_URL is not set — lead not forwarded');
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const body = {
    timestamp: new Date().toISOString(),
    ...payload
  };

  const result = await postToWebhook(url, body);
  console.info('[sheets] lead forwarded', body.source, result.mode);
  return { ok: true, mode: result.mode };
}

function isSheetsConfigured() {
  return Boolean(getWebhookUrl());
}

module.exports = { forwardLeadToGoogleSheets, isSheetsConfigured, getWebhookUrl };
