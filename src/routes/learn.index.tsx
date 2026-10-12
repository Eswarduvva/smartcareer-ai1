import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { LearnLayout } from "@/components/learn/LearnLayout";
import { Button } from "@/components/ui/button";
import { publicHead } from "@/components/PublicLayout";
import { EDUCATIONAL_VIDEOS, VIDEO_COURSE_TITLE } from "@/lib/videos";

export const Route = createFileRoute("/learn/")({
  head: () => publicHead("Explore Videos", "Explore official MIT OpenCourseWare introductory Python video lessons on SmartCareer."),
  component: ExploreVideos,
});

function ExploreVideos() {
  return (
    <LearnLayout>
      <p className="eyebrow mb-3 text-gold">Learning resources</p>
      <h1 className="text-3xl tracking-normal sm:text-4xl">Explore Videos</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{VIDEO_COURSE_TITLE} · MIT OpenCourseWare · Fall 2016</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {EDUCATIONAL_VIDEOS.map((video) => (
          <li key={video.id} className="flex flex-col rounded-lg border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between text-primary"><Play aria-hidden="true" className="size-6" /><span className="eyebrow">Lesson {video.lesson}</span></div>
            <h2 className="text-xl tracking-normal">{video.title}</h2>
            <p className="mt-3 text-xs text-muted-foreground">{video.provider}</p>
            <p className="mb-6 mt-4 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
            <Button asChild className="mt-auto self-start"><Link to="/learn/watch/" search={{ video: video.id }}>Watch lesson <ArrowRight aria-hidden="true" /></Link></Button>
          </li>
        ))}
      </ul>
    </LearnLayout>
  );
}