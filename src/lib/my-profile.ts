import { useEffect, useState } from "react";
import type { StudentRecord } from "./api/types";
import { SKILL_KEYS } from "./skills";
import { readinessScore, recommend } from "./recommend";
import { loadAccount, saveAccount } from "./account";

/**
 * The student's own self-entered profile. Stored on this device only
 * (no sign-in yet, and the database is read-only). Never sent to the database.
 */
export type MyProfile = Omit<StudentRecord, "recommendation">;

const KEY = "sc-my-profile";
const EVT = "sc-my-profile-change";
export const MY_ID = "MY-PROFILE";

export function emptyProfile(): MyProfile {
  return {
    student: {
      student_id: MY_ID, age: null, gender: null, city: null, state: null, degree: null, branch: null,
      specialization: null, college_type: null, graduation_year: null, cgpa: null, backlogs: 0, higher_education_interest: null,
    },
    skills: { student_id: MY_ID, ...Object.fromEntries(SKILL_KEYS.map((k) => [k, 50])) } as MyProfile["skills"],
    experience: { student_id: MY_ID, project_count: 0, internship_count: 0, certification_count: 0, work_experience_months: 0 },
    preferences: {
      student_id: MY_ID, primary_interest: null, secondary_interest: null, preferred_industry: null,
      preferred_work_role: null, preferred_work_mode: null, preferred_location: null, willing_to_relocate: null,
    },
    // Readiness is a calculated value; a student never enters it.
    goals: { student_id: MY_ID, career_goal: null, expected_salary: null, study_hours_per_week: null, career_readiness_score: null },
  };
}

export function loadProfile(): { profile: MyProfile; complete: boolean } | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: MyProfile, complete: boolean) {
  localStorage.setItem(KEY, JSON.stringify({ profile, complete }));
  window.dispatchEvent(new Event(EVT));
  void saveAccount({ profile, complete });
}

export function clearProfile(opts: { keepAccount?: boolean } = {}) {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
  if (!opts.keepAccount) void saveAccount({ profile: null, complete: false });
}

export function toRecord(p: MyProfile): StudentRecord {
  return {
    ...p,
    goals: p.goals ? { ...p.goals, career_readiness_score: readinessScore(p.skills, p.experience) } : p.goals,
    recommendation: p.skills ? recommend(p.skills, p.preferences?.primary_interest) : null };
}

/** undefined = not yet read (SSR / first paint), null = nothing saved. */
export function useMyProfile() {
  const [v, setV] = useState<ReturnType<typeof loadProfile> | undefined>(undefined);
  useEffect(() => {
    const read = () => setV(loadProfile());
    read();
    // The signed-in account is the source of truth; the device copy is a cache.
    loadAccount().then((acc) => {
      if (acc?.profile) {
        localStorage.setItem(KEY, JSON.stringify({ profile: acc.profile, complete: acc.complete }));
        read();
      }
    });
    window.addEventListener(EVT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return v;
}
