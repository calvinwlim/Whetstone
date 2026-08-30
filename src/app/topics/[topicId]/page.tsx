import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonProse } from "@/components/lesson-prose";
import { TopicProgress } from "@/components/topic-progress";
import { ALL_TOPICS, getTopic, getTrack, questionsForTopic } from "@/content";

/** Every topic is known at build time, so all 28 lesson pages ship as static
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
  return { title: `${topic.title} — Drill`, description: topic.blurb };
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
    <article className="pt-2">
      <nav className="flex items-center gap-2 font-mono text-xs text-faint">
        <Link href="/topics" className="hover:text-amber">
          Topics
        </Link>
        <span aria-hidden>/</span>
        <span>{track?.title}</span>
      </nav>

      <header className="mt-4">
        <h1 className="readout text-3xl leading-tight">{topic.title}</h1>
        <p className="mt-2 text-[0.9375rem] text-muted">{topic.blurb}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-rule py-4">
          <div>
            <p className="label">Questions</p>
            <p className="readout mt-0.5 text-xl">{questions.length}</p>
          </div>
          <TopicProgress topicId={topic.id} />
        </div>
      </header>

      <div className="mt-7">
        <LessonProse text={topic.lesson} />
      </div>

      {topic.resources && topic.resources.length > 0 ? (
        <section className="mt-8 border-t border-rule pt-5">
          <p className="label">Go deeper</p>
          <ul className="mt-3 space-y-2">
            {topic.resources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.9375rem] text-amber underline underline-offset-2"
                >
                  {resource.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/drill"
        className="mt-8 block rounded-xl bg-amber px-5 py-4 text-center text-[#0f1720]"
      >
        <span className="readout text-lg">Start today&apos;s drill</span>
      </Link>
    </article>
  );
}
