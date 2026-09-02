import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Whetstone stores, where it lives, who can see it, and how to get rid of it.",
  alternates: { canonical: "/privacy" },
};

/** Kept deliberately short and specific. A policy that lists every
 *  hypothetical is one nobody reads; this describes what the code actually
 *  does, and has to be edited when the code changes. */
export default function PrivacyPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-1.5 text-sm text-text-2">
        Last updated 2 September 2026.
      </p>

      <p className="mt-5 leading-relaxed">
        Whetstone is a personal study tool. It is free, it is not funded by
        advertising, and none of what follows is sold or shared with anyone for
        marketing. There are no advertising or analytics trackers on this site.
      </p>

      <Section title="If you never sign in">
        <p>
          Nothing about you is sent anywhere. Your answers, streak, and review
          schedule are kept in your own browser using local storage. Clearing
          your browser data erases them, and there is no copy for anyone to
          recover.
        </p>
      </Section>

      <Section title="If you do sign in">
        <p>Two things are then stored on a server:</p>
        <ul className="mt-2 space-y-2 pl-5">
          <li className="list-disc">
            <strong>Your email address</strong>, used only to identify your
            account and send sign-in links. It is never displayed to anyone
            else, including on the leaderboard.
          </li>
          <li className="list-disc">
            <strong>Your progress</strong> — which questions you have answered,
            whether you got them right, your XP, streak, and review schedule.
            This is stored so it follows you between devices, and is readable
            only by you. Database rules enforce that, not just application
            code.
          </li>
        </ul>
      </Section>

      <Section title="The leaderboard is opt-in">
        <p>
          You are not on it unless you choose to be. Joining publishes a display
          name you pick, plus four numbers: XP, current streak, questions
          answered, and accuracy. Your email is never published, and neither is
          anything about <em>which</em> questions you answered. The board is
          visible only to people signed in, not to the open web.
        </p>
        <p className="mt-2">
          Leaving deletes the entry outright rather than hiding it. Nothing of
          yours remains on the board afterwards.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Only sign-in cookies, which keep you logged in between visits. They
          are strictly necessary for the account to work, there are no
          advertising or tracking cookies, and so there is no consent banner to
          click through. Signing out removes them.
        </p>
      </Section>

      <Section title="Who processes it">
        <p>
          The site runs on <strong>Vercel</strong>, and accounts and progress
          are stored by <strong>Supabase</strong>. Both act as processors on
          Whetstone&apos;s behalf, and both keep standard server logs
          containing IP addresses for security and debugging. No other third
          party receives your data.
        </p>
      </Section>

      <Section title="How long it is kept">
        <p>
          For as long as your account exists. There is no archive: deleting
          your account removes your progress and any leaderboard entry at the
          same moment, because the database removes them along with the
          account rather than leaving them to be cleaned up later.
        </p>
      </Section>

      <Section title="What you can do">
        <ul className="space-y-2 pl-5">
          <li className="list-disc">
            <strong>See it.</strong> Everything held about you is shown on your{" "}
            <Link
              href="/profile"
              className="font-medium text-text underline underline-offset-2"
            >
              profile
            </Link>{" "}
            and{" "}
            <Link
              href="/stats"
              className="font-medium text-text underline underline-offset-2"
            >
              stats
            </Link>{" "}
            pages.
          </li>
          <li className="list-disc">
            <strong>Erase your progress</strong> but keep the account, from{" "}
            <Link
              href="/settings"
              className="font-medium text-text underline underline-offset-2"
            >
              settings
            </Link>
            .
          </li>
          <li className="list-disc">
            <strong>Delete the account entirely</strong>, from your profile. It
            is immediate and cannot be undone — no grace period, no soft delete.
          </li>
        </ul>
        <p className="mt-2">
          If you are in the UK or EU, the rights of access, rectification,
          erasure and portability apply. The controls above cover the first
          three directly; for a copy of your data in a portable form, ask.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Whetstone is aimed at working software engineers and is not intended
          for children under 13.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes in a way that affects what is collected or who
          receives it, the date at the top changes and anyone with an account
          is told before it takes effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, or a request to exercise any of the above:{" "}
          <a
            href="mailto:wlcalvin3@gmail.com"
            className="font-medium text-text underline underline-offset-2"
          >
            wlcalvin3@gmail.com
          </a>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-border pt-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2 leading-relaxed text-text-2">{children}</div>
    </section>
  );
}
