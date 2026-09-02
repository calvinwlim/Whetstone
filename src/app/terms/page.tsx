import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The short version of what Whetstone offers, what it does not promise, and what is expected of you.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Terms of use</h1>
      <p className="mt-1.5 text-sm text-text-2">
        Last updated 2 September 2026.
      </p>

      <p className="mt-5 leading-relaxed">
        Whetstone is a free study tool run by one person. These terms are short
        on purpose, and say what you can actually expect.
      </p>

      <Section title="What it is">
        <p>
          Practice questions and short written lessons on software engineering
          topics, scheduled for review over time. It is a revision aid, not
          training, certification, or professional advice. Nothing here is a
          promise that you will pass an interview.
        </p>
      </Section>

      <Section title="The content may be wrong">
        <p>
          The questions and explanations are written by hand and reviewed, but
          this field moves and mistakes happen. Treat an explanation as a
          starting point for reading rather than a citable authority — which is
          why each answer names the concepts behind it and links out. If you
          find something wrong, say so and it will be fixed.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          Keep control of the email address you sign in with; anyone who can
          read that inbox can reach your account. You are responsible for what
          happens under it.
        </p>
        <p className="mt-2">
          Pick a display name for the leaderboard that you would be comfortable
          showing a colleague. Names that impersonate somebody else, or that
          are abusive, will be removed, and repeated abuse means the account
          goes.
        </p>
      </Section>

      <Section title="Fair use">
        <p>
          Use it to study. Do not scrape the question bank wholesale, try to
          break the service for other people, or attempt to reach data that is
          not yours. The leaderboard is a bit of fun — the numbers come from
          each person&apos;s own browser, so please do not spend your time
          gaming a scoreboard nobody is policing.
        </p>
      </Section>

      <Section title="Donations">
        <p>
          Whetstone is free and will stay free. Donations are voluntary, buy no
          features, and are not refundable — they cover hosting and the time
          spent writing questions. Choosing not to donate changes nothing about
          what you can use.
        </p>
      </Section>

      <Section title="No guarantees">
        <p>
          This is provided as it is, with no warranty. It runs on free hosting
          tiers and may be slow, briefly unavailable, or occasionally broken. I
          take backups and take your progress seriously, but you should not
          treat this as the only record of anything that matters to you.
        </p>
      </Section>

      <Section title="Ending it">
        <p>
          You can delete your account at any moment from your{" "}
          <Link
            href="/profile"
            className="font-medium text-text underline underline-offset-2"
          >
            profile
          </Link>
          , with no confirmation email and no waiting period. The service
          itself could be discontinued; if that happens, anyone with an account
          gets reasonable notice and a chance to export their progress first.
        </p>
      </Section>

      <Section title="Content ownership">
        <p>
          The questions, lessons, and the site itself remain the author&apos;s
          work. You are welcome to use them to study and to quote them in
          conversation; republishing the question bank as your own is not on.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <a
            href="mailto:wlcalvin3@gmail.com"
            className="font-medium text-text underline underline-offset-2"
          >
            wlcalvin3@gmail.com
          </a>{" "}
          — see also the{" "}
          <Link
            href="/privacy"
            className="font-medium text-text underline underline-offset-2"
          >
            privacy policy
          </Link>
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
