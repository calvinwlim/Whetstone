import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-card border border-border p-5">
      <h1 className="text-lg font-semibold">There is nothing at this address</h1>
      <p className="mt-1.5 max-w-prose text-sm text-text-2">
        The link may be out of date, or a topic may have been renamed. Every
        lesson is listed on the topics page.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/topics" className="btn btn-primary px-3.5 py-2 text-sm">
          Browse topics
        </Link>
        <Link href="/" className="btn btn-quiet px-3.5 py-2 text-sm">
          Back to today
        </Link>
      </div>
    </div>
  );
}
