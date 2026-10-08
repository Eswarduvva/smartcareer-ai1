/**
 * CENTRAL DEMO DATA — the only place sample records live.
 * Pages never import this directly; they go through the ApiAdapter (src/lib/api).
 * When the real backend is connected, this folder is no longer used.
 */
import type { ActivityItem, SkillKey, StudentRecord, StudentSummary } from "../api/types";
import { SKILL_KEYS, SKILLS, GAP_THRESHOLD } from "../skills";
import { CAREER_TRACKS } from "../careers";
import { readinessScore, recommend } from "../recommend";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PEOPLE: [string, string, string, string, string, string, number][] = [
  // name, gender, degree, branch, specialization, city/state, favoured track index
  ["Ananya Reddy", "Female", "B.Tech", "Computer Science", "Data Science", "Hyderabad|Telangana", 1],
  ["Rohan Mehta", "Male", "B.Tech", "Information Technology", "Software Systems", "Pune|Maharashtra", 0],
  ["Priya Nair", "Female", "B.Sc", "Statistics", "Applied Statistics", "Kochi|Kerala", 1],
  ["Arjun Sharma", "Male", "B.Tech", "Computer Science", "AI & ML", "Bengaluru|Karnataka", 2],
  ["Sneha Iyer", "Female", "B.Des", "Communication Design", "Interaction Design", "Chennai|Tamil Nadu", 3],
  ["Karthik Rao", "Male", "B.E", "Electronics", "Embedded Systems", "Mysuru|Karnataka", 4],
  ["Divya Patel", "Female", "BCA", "Computer Applications", "Web Technologies", "Ahmedabad|Gujarat", 0],
  ["Vikram Singh", "Male", "B.Tech", "Information Technology", "Cloud Computing", "Jaipur|Rajasthan", 4],
  ["Meera Krishnan", "Female", "M.Sc", "Data Science", "Machine Learning", "Coimbatore|Tamil Nadu", 2],
  ["Aditya Kulkarni", "Male", "B.Tech", "Computer Science", "Full-Stack Development", "Nagpur|Maharashtra", 0],
  ["Fatima Shaikh", "Female", "MBA", "Business Analytics", "Marketing Analytics", "Mumbai|Maharashtra", 1],
  ["Rahul Verma", "Male", "B.Tech", "Mechanical", "Industrial Engineering", "Lucknow|Uttar Pradesh", 1],
  ["Ishita Banerjee", "Female", "B.Tech", "Computer Science", "Human-Computer Interaction", "Kolkata|West Bengal", 3],
  ["Siddharth Menon", "Male", "MCA", "Computer Applications", "DevOps", "Thiruvananthapuram|Kerala", 4],
  ["Neha Gupta", "Female", "B.Tech", "Electronics", "Signal Processing", "Delhi|Delhi", 2],
  ["Aman Joshi", "Male", "BCA", "Computer Applications", "Mobile Development", "Dehradun|Uttarakhand", 0],
  ["Lakshmi Prasad", "Female", "B.Sc", "Mathematics", "Operations Research", "Visakhapatnam|Andhra Pradesh", 1],
  ["Harsh Agarwal", "Male", "B.Tech", "Information Technology", "Cyber Security", "Indore|Madhya Pradesh", 4],
  ["Pooja Desai", "Female", "B.Des", "Product Design", "UX Research", "Pune|Maharashtra", 3],
  ["Nikhil Chawla", "Male", "M.Tech", "Computer Science", "Deep Learning", "Chandigarh|Punjab", 2],
  ["Sanya Kapoor", "Female", "B.Tech", "Computer Science", "Software Engineering", "Gurugram|Haryana", 0],
  ["Yash Thakur", "Male", "B.E", "Computer Science", "Data Engineering", "Bhopal|Madhya Pradesh", 1],
  ["Ritika Sen", "Female", "BBA", "Business Administration", "Digital Marketing", "Bhubaneswar|Odisha", 3],
  ["Manoj Kumar", "Male", "B.Tech", "Electrical", "Power Systems", "Patna|Bihar", 4],
];

const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

function build(i: number): StudentRecord {
  const r = rng(i * 7919 + 101);
  const [name, gender, degree, branch, spec, place, fav] = PEOPLE[i]!;
  const [city, state] = place.split("|") as [string, string];
  const track = CAREER_TRACKS[fav]!;
  const id = `SC-${1001 + i}`;
  const level = 0.75 + r() * 0.4; // overall strength of this student
  const skills = Object.fromEntries(
    SKILL_KEYS.map((k) => {
      const boost = track.skills.includes(k) ? 14 + r() * 18 : 0;
      return [k, Math.max(28, Math.min(96, round((40 + r() * 28 + boost) * level)))];
    }),
  ) as Record<SkillKey, number>;
  const skillRow = { student_id: id, ...skills };
  const experience = {
    student_id: id,
    project_count: Math.floor(r() * 6),
    internship_count: Math.floor(r() * 3),
    certification_count: Math.floor(r() * 5),
    work_experience_months: r() > 0.7 ? Math.floor(r() * 9) : 0,
  };
  const preferences = {
    student_id: id,
    primary_interest: track.domain,
    secondary_interest: CAREER_TRACKS[(fav + 1) % CAREER_TRACKS.length]!.domain,
    preferred_industry: ["Technology", "Finance", "Healthcare", "E-commerce", "Consulting"][i % 5]!,
    preferred_work_role: track.role,
    preferred_work_mode: ["Hybrid", "On-site", "Remote"][i % 3]!,
    preferred_location: city,
    willing_to_relocate: r() > 0.4 ? "Yes" : "No",
  };
  return {
    student: {
      student_id: id,
      full_name: name,
      age: 20 + Math.floor(r() * 4),
      gender,
      city,
      state,
      degree,
      branch,
      specialization: spec,
      college_type: ["Private", "Government", "Autonomous", "Deemed"][i % 4]!,
      graduation_year: 2025 + (i % 3),
      cgpa: round(6.4 + r() * 3.2, 2),
      backlogs: r() > 0.85 ? 1 : 0,
      higher_education_interest: ["Yes", "No", "Maybe"][i % 3]!,
    },
    skills: skillRow,
    experience,
    preferences,
    goals: {
      student_id: id,
      career_goal: track.role,
      expected_salary: Math.round(4 + r() * 8) * 100000,
      study_hours_per_week: Math.round(8 + r() * 16),
      career_readiness_score: readinessScore(skillRow, experience),
    },
    recommendation: recommend(skillRow, track.domain),
  };
}

export const mockStudents: StudentRecord[] = PEOPLE.map((_, i) => build(i));

export function toSummary(rec: StudentRecord): StudentSummary {
  const sc = rec.skills;
  const scored = sc ? SKILLS.map((s) => ({ label: s.label, v: sc[s.key] ?? 0 })) : [];
  return {
    ...rec.student,
    readiness: rec.goals?.career_readiness_score ?? null,
    match: rec.recommendation?.career_match_score ?? null,
    role: rec.recommendation?.recommended_role ?? null,
    top_skills: [...scored].sort((a, b) => b.v - a.v).slice(0, 3).map((s) => s.label),
    gap_count: sc ? scored.filter((s) => s.v < GAP_THRESHOLD).length : null,
  };
}

/** The realistic profile behind "Fill with a sample profile" in the builder. */
export const mockSampleProfileId = "SC-1001";

const ACTIONS = ["completed their career profile", "viewed their roadmap", "updated skill scores", "checked career match", "marked a roadmap step done", "added a new project"];
const WHEN = ["12 min ago", "40 min ago", "1 h ago", "2 h ago", "3 h ago", "5 h ago", "Yesterday", "Yesterday", "2 days ago", "3 days ago"];

export const mockActivity: ActivityItem[] = WHEN.map((when, i) => {
  const s = mockStudents[(i * 5) % mockStudents.length]!.student;
  return { student_id: s.student_id, name: s.full_name ?? s.student_id, action: ACTIONS[i % ACTIONS.length]!, when };
});
