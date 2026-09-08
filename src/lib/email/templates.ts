/** Plain functions returning { subject, text, html }, not a templating
 *  library or React components -- there is exactly one email today, and
 *  Resend's `react` option is there if a second one ever needs real
 *  layout. Keeping these here rather than inline at the call site is the
 *  only structure this needs: one place to read every email Whetstone
 *  sends, and one place a future one gets added next to it. */

export function accountDeletedEmail(): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Your Whetstone account has been deleted";
  const text = [
    "Your Whetstone account and everything in it -- progress, streak, and any leaderboard entry -- have been deleted.",
    "",
    "This happened because the account was deleted from Whetstone's profile page. If that was not you, the account is already gone and cannot be recovered, but you may want to check whether your email account itself has been compromised.",
    "",
    "This is a one-off notice. You will not hear from Whetstone again unless you sign up again.",
  ].join("\n");
  const html = `
    <p>Your Whetstone account and everything in it — progress, streak, and any leaderboard entry — have been deleted.</p>
    <p>This happened because the account was deleted from Whetstone's profile page. If that was not you, the account is already gone and cannot be recovered, but you may want to check whether your email account itself has been compromised.</p>
    <p>This is a one-off notice. You will not hear from Whetstone again unless you sign up again.</p>
  `.trim();
  return { subject, text, html };
}
