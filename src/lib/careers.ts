import type { SkillKey } from "./api/types";

/**
 * Career catalog used by the rule-based recommendation.
 * Each track lists five key skills; each key skill targets STRONG_THRESHOLD.
 */
export interface CareerTrack {
  id: string;
  domain: string;
  role: string;
  skills: SkillKey[];
  description: string;
  outlook: string;
  dayToDay: string[];
  /** General career guidance, not a verified employer eligibility requirement. */
  education?: string;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: "software-developer",
    domain: "Software Engineering",
    role: "Software Developer",
    skills: ["programming_score", "technical_score", "problem_solving_score", "logical_reasoning_score", "teamwork_score"],
    description: "Designs, writes and maintains the applications and services people use every day.",
    outlook: "Consistently one of the largest hiring categories for engineering graduates, from startups to large IT services firms.",
    dayToDay: ["Write and review code", "Fix bugs and ship features", "Work in a product team"],
    education: "Computer science, IT or a related degree is a common route. Equivalent practical experience and a strong coding portfolio may also qualify; check each employer's requirements.",
  },
  {
    id: "data-analyst",
    domain: "Data Analytics",
    role: "Data Analyst",
    skills: ["data_analysis_score", "sql_score", "statistics_score", "python_score", "analytical_thinking_score"],
    description: "Turns raw business data into reports, dashboards and clear answers for decision makers.",
    outlook: "Strong entry-level demand across finance, e-commerce, consulting and healthcare.",
    dayToDay: ["Query and clean data", "Build dashboards", "Explain findings to teams"],
    education: "A degree in statistics, mathematics, computing, business or a related field is common. SQL, analytical projects and clear reporting support applications.",
  },
  {
    id: "data-scientist",
    domain: "Data Science & ML",
    role: "Data Scientist",
    skills: ["python_score", "machine_learning_score", "deep_learning_score", "statistics_score", "data_analysis_score"],
    description: "Builds predictive models and experiments that help products and businesses learn from data.",
    outlook: "Growing demand, usually after strong projects or a first analytics role; higher study expectations.",
    dayToDay: ["Train and evaluate models", "Run experiments", "Prototype ML features"],
    education: "A quantitative or computing degree with statistics and machine learning coursework is common. Some roles require postgraduate study; requirements vary by employer.",
  },
  {
    id: "ui-ux-designer",
    domain: "Product Design",
    role: "UI/UX Designer",
    skills: ["creativity_score", "communication_score", "problem_solving_score", "analytical_thinking_score", "teamwork_score"],
    description: "Researches user needs and designs interfaces that are clear, usable and good to look at.",
    outlook: "Portfolio-driven hiring; product companies and agencies value a strong case-study portfolio.",
    dayToDay: ["Interview users", "Wireframe and prototype", "Test designs with real people"],
    education: "Design, human-computer interaction or related study can help. Many employers emphasise a portfolio showing research, design decisions and usability testing.",
  },
  {
    id: "cloud-devops",
    domain: "Cloud & Infrastructure",
    role: "Cloud/DevOps Engineer",
    skills: ["technical_score", "programming_score", "problem_solving_score", "adaptability_score", "logical_reasoning_score"],
    description: "Keeps software running reliably: automates deployments, manages cloud systems and monitors uptime.",
    outlook: "High demand as companies move to the cloud; certifications carry real weight in hiring.",
    dayToDay: ["Automate deployments", "Manage cloud resources", "Monitor and fix incidents"],
    education: "Computer science, IT or related study is a common route. Hands-on systems experience and relevant cloud certifications can support applications.",
  },
];

export const INTEREST_OPTIONS = CAREER_TRACKS.map((t) => t.domain);
export const ROLE_OPTIONS = CAREER_TRACKS.map((t) => t.role);
export const trackByRole = (role?: string | null) => CAREER_TRACKS.find((t) => t.role === role);
export const trackById = (id?: string | null) => CAREER_TRACKS.find((t) => t.id === id);

/** Why each skill matters and one concrete way to improve it. */
export const SKILL_GUIDE: Record<SkillKey, { why: string; action: string }> = {
  python_score: { why: "The default language for data, automation and ML work.", action: "Solve 30 Python exercises, then automate one real task you do weekly." },
  sql_score: { why: "Almost every company stores its data in SQL databases.", action: "Complete an SQL course and answer 20 questions on a public dataset." },
  data_analysis_score: { why: "Turning messy data into a clear answer is the core of analytics roles.", action: "Analyse one open dataset end-to-end and publish the notebook." },
  statistics_score: { why: "Needed to judge whether a result is real or just noise.", action: "Revise probability, distributions and hypothesis testing with worked examples." },
  machine_learning_score: { why: "Required to build and evaluate predictive models.", action: "Train, tune and compare three models on one Kaggle-style problem." },
  deep_learning_score: { why: "Powers image, text and speech applications.", action: "Follow a neural-network course and build one image or text classifier." },
  programming_score: { why: "The base skill for building any software.", action: "Build a small app from scratch and push it to GitHub with a README." },
  technical_score: { why: "Shows you understand how systems, networks and tools fit together.", action: "Study one core CS subject (OS, networks or DBMS) and summarise it in notes." },
  aptitude_score: { why: "Most campus placement tests start with an aptitude round.", action: "Practise 20 timed aptitude questions three times a week." },
  logical_reasoning_score: { why: "Helps you break problems into clear, correct steps.", action: "Do daily logic puzzles and easy algorithm problems." },
  problem_solving_score: { why: "Interviews and real work both reward structured problem solving.", action: "Solve two coding or case problems a day and write down your approach." },
  analytical_thinking_score: { why: "Lets you spot patterns and ask the right questions.", action: "Break down one business case study a week into causes and effects." },
  communication_score: { why: "Your work only counts if others understand it.", action: "Present one project to peers and ask for specific feedback." },
  english_score: { why: "Most workplace writing, documentation and interviews are in English.", action: "Write a short weekly blog post or project summary and get it reviewed." },
  creativity_score: { why: "Leads to better product ideas and designs.", action: "Redesign one app screen you use daily and explain your choices." },
  leadership_score: { why: "Shows you can own outcomes, not just tasks.", action: "Lead a small club activity, hackathon team or study group." },
  teamwork_score: { why: "Almost all real projects are team projects.", action: "Contribute to a group project or an open-source issue." },
  adaptability_score: { why: "Tools change fast; adaptable people keep up.", action: "Learn one new tool a month and use it in a mini project." },
  learning_interest_score: { why: "Consistent learners grow fastest after graduation.", action: "Set a fixed weekly study slot and track it for a month." },
};
