import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Play } from "lucide-react";
import { LearnLayout } from "@/components/learn/LearnLayout";
import { Button } from "@/components/ui/button";
import { publicHead } from "@/components/PublicLayout";
import { getVideoSelection, VIDEO_COURSE_TITLE } from "@/lib/videos";

export const Route = createFileRoute("/learn/watch/")({
  validateSearch: (search: Record<string, unknown>): { video?: string } => ({
    video: typeof search.video === "string" ? search.video : undefined,
  }),
  head: ({ match }) => {
    const { video } = getVideoSelection(match.search.video);
    return publicHead(video?.title ?? "Video unavailable", video?.description ?? "Explore official educational videos on SmartCareer.");
  },
  component: WatchVideo,
});

function WatchVideo() {
  const search = Route.useSearch();
  const { video, previous, next, related } = getVideoSelection(search.video);
  return (
    <LearnLayout>
      <Button asChild variant="outline" className="mb-7"><Link to="/learn/"><ArrowLeft aria-hidden="true" />Explore Videos</Link></Button>
      {!video ? (
        <div role="status" className="py-12">
          <h1 className="text-3xl tracking-normal">Video unavailable</h1>
          <p className="mt-3 text-muted-foreground">This lesson could not be found.</p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0" aria-label="Current lesson">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
              <iframe
                key={video.id}
                src={video.embedUrl}
                title={video.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Video not playing?</p>
              <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-1 text-left"><a href={video.providerUrl} target="_blank" rel="noopener noreferrer">Watch on {video.provider}<ExternalLink aria-hidden="true" /></a></Button>
            </div>
            <p className="eyebrow mb-3 mt-7 text-gold">Lesson {video.lesson} · Python</p>
            <h1 className="break-words text-3xl leading-tight tracking-normal sm:text-4xl">{video.title}</h1>
            <p className="mt-4 text-sm font-semibold text-primary">{video.provider}</p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{video.description}</p>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{VIDEO_COURSE_TITLE} · Fall 2016</p>
            <nav aria-label="Lesson navigation" className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div>{previous && <Button asChild variant="outline" className="h-auto w-full justify-start whitespace-normal py-3"><Link to="/learn/watch/" search={{ video: previous.id }}><ArrowLeft aria-hidden="true" />Previous lesson</Link></Button>}</div>
              <div>{next && <Button asChild className="h-auto w-full whitespace-normal py-3"><Link to="/learn/watch/" search={{ video: next.id }}>Next lesson<ArrowRight aria-hidden="true" /></Link></Button>}</div>
            </nav>
          </section>
          <aside className="min-w-0" aria-label="Related educational videos">
            <h2 className="mb-5 text-xl tracking-normal">Related videos</h2>
            <ul className="divide-y divide-border border-y border-border">
              {related.map((item) => (
                <li key={item.id}>
                  <Button asChild variant="ghost" className="h-auto w-full justify-start whitespace-normal rounded-none px-0 py-5 text-left">
                    <Link to="/learn/watch/" search={{ video: item.id }}>
                      <Play aria-hidden="true" className="text-primary" />
                      <span className="min-w-0"><span className="mb-2 block text-xs text-muted-foreground">Lesson {item.lesson} · {item.provider}</span><span className="block leading-relaxed">{item.title}</span></span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </LearnLayout>
  );
}