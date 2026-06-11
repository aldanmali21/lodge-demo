// SMS delivery via Africa's Talking.
//
// This is a STUB: it is wired into the invite flow but does not call the real API yet.
// When credentials are present in .env it will attempt the real send; otherwise it logs
// the message and resolves gracefully so the invite flow never breaks.
//
// To go live:
//   1. npm install africastalking
//   2. Fill AT_USERNAME, AT_API_KEY, AT_SENDER in .env
//   3. Uncomment the "real send" block below.

const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;
const AT_SENDER = process.env.AT_SENDER; // optional alphanumeric sender id / shortcode

const isConfigured = Boolean(AT_USERNAME && AT_API_KEY);

/**
 * Send an invite via SMS.
 * @param {{ to: string, role: string, inviteUrl: string, inviterName: string }} opts
 * @returns {Promise<{ delivered: boolean, stub?: boolean, error?: string }>}
 */
async function sendInviteSms({ to, role, inviteUrl, inviterName }) {
  if (!to) {
    return { delivered: false, error: 'No phone number provided.' };
  }

  const message =
    `${inviterName} invited you to Twin Lakes Safari Lodge as ${role}. ` +
    `Set up your account (expires in 48h): ${inviteUrl}`;

  if (!isConfigured) {
    // Stub mode — no credentials configured. Log and resolve so the flow continues.
    console.log(`[SMS stub] would send to ${to}: ${message}`);
    return { delivered: false, stub: true };
  }

  // TODO: wire real Africa's Talking API here once `africastalking` is installed and
  // credentials are set. Intended implementation:
  //
  //   const AfricasTalking = require('africastalking')({
  //     username: AT_USERNAME,
  //     apiKey: AT_API_KEY,
  //   });
  //   const result = await AfricasTalking.SMS.send({
  //     to: [to],
  //     message,
  //     from: AT_SENDER, // omit to use the AT sandbox/default sender
  //   });
  //   return { delivered: true, providerResponse: result };

  // Until the SDK is wired, behave like the stub even if keys exist, so we never
  // make a half-configured network call.
  console.log(`[SMS pending-integration] would send to ${to}: ${message}`);
  return { delivered: false, stub: true };
}

module.exports = { sendInviteSms, isConfigured };
