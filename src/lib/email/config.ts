import { Resend } from "resend";

/** Email is optional, the same way every other external service in this app
 *  is: with no API key configured, sendEmail() is a safe no-op rather than a
 *  crash, so a clone with no Resend account still builds and runs.
 *
 *  RESEND_API_KEY is a placeholder name, not a confirmed one. Whetstone's
 *  domain (whetstonehq.dev) has not been verified in Resend's dashboard yet
 *  -- until it is, Resend never actually provisions a resource or an API
 *  key, so there is nothing yet to read the real variable name from. Every
 *  other marketplace resource in this project (Rollbar, Supabase) came back
 *  from Vercel with a per-installation suffix rather than the plain name a
 *  provider's own docs assume -- see src/lib/rollbar/config.ts for exactly
 *  that pattern -- so treat this name as provisional until `vercel env ls`
 *  after verification says otherwise, and update only this one line. */
const RAW_API_KEY = process.env.RESEND_API_KEY;

export function isEmailConfigured(): boolean {
  return Boolean(RAW_API_KEY);
}

const client = RAW_API_KEY ? new Resend(RAW_API_KEY) : null;

/** The domain chosen when the Resend integration was installed. Sending
 *  will fail until this exact domain is verified (SPF/DKIM added) in
 *  Resend's dashboard -- see isEmailConfigured() above for why there is no
 *  key yet either. */
const FROM_ADDRESS = "Whetstone <noreply@whetstonehq.dev>";

/** Fire-and-forget in spirit, but not in implementation: every call site so
 *  far is a side effect of something that already succeeded (an account was
 *  already deleted), so a failure here must never surface as an error to the
 *  person who took that action -- it only ever returns whether the email
 *  went out, for a caller that wants to know without having to handle a
 *  throw. */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!client) return false;
  try {
    const { error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text,
    });
    if (error) {
      console.warn("[whetstone] email send failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[whetstone] email send threw:", err);
    return false;
  }
}
