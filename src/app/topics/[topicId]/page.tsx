import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonProse } from "@/components/lesson-prose";
import { TopicProgress } from "@/components/topic-progress";
import { DifficultySpread } from "@/components/difficulty-pill";
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
  return { title: `${topic.title} — Whetstone`, description: topic.blurb };
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
        <Link href="/topics" className="hover:text-green hover:underline">
          Topics
        </Link>
        <span aria-hidden>›</span>
        <span>{track?.title}</span>
      </nav>

      <h1 className="mt-2 text-xl font-semibold">{topic.title}</h1>
      <p className="mt-1 text-sm text-text-2">{topic.blurb}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="text-text-2">Questions</span>
          <span className="font-mono tabular-nums">{questions.length}</span>
        </span>
        <span className="flex items-center gap-1.5" title="Easy / Medium / Hard">
          <span className="text-text-2">E/M/H</span>
          <DifficultySpread
            difficulties={questions.map((question) => question.difficulty)}
          />
        </span>
        <TopicProgress topicId={topic.id} />
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <LessonProse text={topic.lesson} />

        <aside className="space-y-3 lg:sticky lg:top-16">
          {topic.resources && topic.resources.length > 0 ? (
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold">Go deeper</h2>
              <ul className="mt-2 space-y-1.5">
                {topic.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-text-2 underline underline-offset-2 hover:text-green"
                    >
                      {resource.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href={`/drill?topic=${topic.id}`}
            className="key key-ink block px-4 py-3 text-center text-base"
          >
            Drill this topic
          </Link>

          <Link
            href="/drill"
            className="block text-center text-sm text-text-2 underline underline-offset-2 hover:text-green"
          >
            Or start today&apos;s drill
          </Link>
        </aside>
      </div>
    </article>
  );
}
