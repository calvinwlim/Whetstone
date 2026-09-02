import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonProse } from "@/components/lesson-prose";
import { TopicProgress } from "@/components/topic-progress";
import { DifficultySpread } from "@/components/difficulty-pill";
import { Field } from "@/components/field";
import { ALL_TOPICS, getTopic, getTrack, questionsForTopic } from "@/content";

/** Every topic is known at build time, so all lesson pages ship as static
 *  HTML -- no server work per visit. */
export function generateStaticParams() {
  return ALL_TOPICS.map((topic) => ({ topicId: topic.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/topics/[topicId]">): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) return { title: "Topic not found" };

  const url = `/topics/${topic.id}`;
  return {
    title: topic.title,
    description: topic.blurb,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: topic.title,
      description: topic.blurb,
      // Named explicitly so the card carries a per-topic alt. The file
      // convention would otherwise apply one static string to all 79.
      images: [
        {
          url: `${url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${topic.title} — ${topic.blurb}`,
        },
      ],
    },
    // The whole twitter object replaces the layout's rather than merging
    // into it, so the card type has to be restated or it falls back to the
    // small "summary" thumbnail.
    twitter: {
      card: "summary_large_image",
      title: topic.title,
      description: topic.blurb,
    },
  };
}

export default async function TopicPage({
  params,
}: PageProps<"/topics/[topicId]">) {
  const { topicId } = await params;

  const topic = getTopic(topicId);
  if (!topic) notFound();

  const track = getTrack(topic.track);
  const questions = questionsForTopic(topic.id);

  return (
    <article>
      <nav className="flex items-center gap-1.5 text-sm text-text-2">
        <Link href="/topics" className="hover:text-text hover:underline">
          Topics
        </Link>
        <span aria-hidden>›</span>
        <span>{track?.title}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {topic.title}
      </h1>
      <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-text-2">
        {topic.blurb}
      </p>

      {/* Facts about the topic read as a strip under the title; actions and
          links live in the rail, so the two never compete. */}
      <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-3 border-y border-border py-3">
        <Field label="Questions" value={String(questions.length)} />
        <Field label="Easy / Med / Hard">
          <DifficultySpread
            difficulties={questions.map((question) => question.difficulty)}
          />
        </Field>
        <TopicProgress topicId={topic.id} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <LessonProse text={topic.lesson} />

        <aside className="space-y-3 lg:sticky lg:top-[4.5rem]">
          <div className="rounded-card border border-border p-4">
            <h2 className="text-sm font-semibold">Practice</h2>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-text-2">
              {questions.length} questions on this topic, mixed difficulty.
            </p>
            <Link
              href={`/drill?topic=${topic.id}`}
              className="key key-ink mt-3 block px-4 py-2.5 text-center text-[0.9375rem]"
            >
              Drill this topic
            </Link>
            <Link
              href="/drill"
              className="mt-2.5 block text-center text-[0.8125rem] text-text-2 underline underline-offset-2 hover:text-text"
            >
              Or start today&apos;s drill
            </Link>
          </div>

          {topic.resources && topic.resources.length > 0 ? (
            <div className="rounded-card border border-border p-4">
              <h2 className="text-sm font-semibold">Go deeper</h2>
              <ul className="mt-2 space-y-1.5">
                {topic.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[0.8125rem] leading-snug text-text-2 underline underline-offset-2 hover:text-text"
                    >
                      {resource.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
