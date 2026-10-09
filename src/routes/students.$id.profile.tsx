import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Tile } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt } from "@/lib/skills";

export const Route = createFileRoute("/students/$id/profile")({
  head: ({ params }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Student ${params.id} profile — SmartCareer` },
      { name: "description", content: "Academic and personal profile of the student." },
      { property: "og:title", content: `Student ${params.id} profile — SmartCareer` },
      { property: "og:description", content: "Academic and personal profile of the student." },
    ],
  }),
  component: Profile,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v ?? "—"}</span>
    </div>
  );
}

function Profile() {
  const { student: s, preferences: p, goals: g } = useRecord();
  return (
    <div>
      <PageHead eyebrow="Profile" title={<span className="num">{s.student_id}</span>} />
      <div className="grid gap-3 lg:grid-cols-3">
        <Tile className="lg:col-span-2" label="Academic">
          <div className="grid gap-8 md:grid-cols-[auto_1fr]">
            <div>
              <p className="num text-7xl font-medium">{fmt(s.cgpa, 2)}</p>
              <p className="eyebrow mt-2">CGPA</p>
            </div>
            <div>
              <p className="text-2xl font-medium">{s.degree} — {s.branch}</p>
              <p className="text-muted-foreground">{s.specialization}</p>
              <div className="mt-4">
                <Row k="College type" v={s.college_type} />
                <Row k="Graduation year" v={<span className="num">{s.graduation_year}</span>} />
                <Row k="Backlogs" v={<span className="num">{s.backlogs}</span>} />
                <Row k="Higher education interest" v={s.higher_education_interest} />
              </div>
            </div>
          </div>
        </Tile>
        <Tile label="Personal">
          <Row k="Age" v={<span className="num">{s.age}</span>} />
          <Row k="Gender" v={s.gender} />
          <Row k="City" v={s.city} />
          <Row k="State" v={s.state} />
        </Tile>
        <Tile className="lg:col-span-2" label="Career preferences">
          <div className="grid gap-x-8 md:grid-cols-2">
            <div>
              <Row k="Primary interest" v={p?.primary_interest} />
              <Row k="Secondary interest" v={p?.secondary_interest} />
              <Row k="Preferred industry" v={p?.preferred_industry} />
              <Row k="Preferred role" v={p?.preferred_work_role} />
            </div>
            <div>
              <Row k="Work mode" v={p?.preferred_work_mode} />
              <Row k="Location" v={p?.preferred_location} />
              <Row k="Willing to relocate" v={p?.willing_to_relocate} />
            </div>
          </div>
        </Tile>
        <Tile label="Goals">
          <p className="text-lg font-medium">{g?.career_goal ?? "—"}</p>
          <div className="mt-3">
            <Row k="Expected salary" v={<span className="num">{g?.expected_salary?.toLocaleString() ?? "—"}</span>} />
            <Row k="Study hours / week" v={<span className="num">{g?.study_hours_per_week}</span>} />
          </div>
        </Tile>
      </div>
    </div>
  );
}
