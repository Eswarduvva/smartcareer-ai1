import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, publicHead } from "@/components/PublicLayout";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({ meta: [...publicHead("Access restricted", "You don't have permission to view this page.").meta, { name: "robots", content: "noindex" }] }),
  component: () => (
    <PublicLayout eyebrow="Access restricted" title="You don't have access to this page" intro="This area is for a different role. If you think you should have access, ask an administrator.">
      <div className="flex flex-wrap gap-4">
        <Link to="/me" className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">Go to my dashboard</Link>
        <Link to="/contact" className="border border-border px-6 py-3 font-mono text-xs uppercase tracking-wider hover:border-foreground">Contact support</Link>
        <Link to="/setup-admin" className="border border-border px-6 py-3 font-mono text-xs uppercase tracking-wider hover:border-foreground">Project owner? Set up admin</Link>
      </div>
    </PublicLayout>
  ),
});
