const { forwardLeadToGoogleSheets } = require('./googleSheets');

async function notifyConsultationCreated(consultation) {
  const sheetsPayload = {
    source: 'consultation',
    type: consultation.needType,
    phone: consultation.phone,
    email: consultation.userEmail,
    message: consultation.message,
    city: consultation.scenarioId || '',
    readiness: consultation.stepId || '',
    dealId: consultation.dealId || '',
    consultationId: consultation.id
  };

  let sheets = { ok: false, skipped: true };
  try {
    sheets = await forwardLeadToGoogleSheets(sheetsPayload);
  } catch (err) {
    console.error('[notifications] sheets error', err);
    sheets = { ok: false, error: err instanceof Error ? err.message : 'sheets_error' };
  }

  console.info('[notifications] consultation saved', consultation.id, consultation.needType, sheets);
  return { queued: sheets.ok, saved: true, sheets };
}

module.exports = { notifyConsultationCreated };
