export interface EducationalVideo {
  id: string;
  title: string;
  provider: string;
  description: string;
  providerUrl: string;
  embedUrl: string;
  lesson: number;
}

const courseUrl = "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/";

export const EDUCATIONAL_VIDEOS: readonly EducationalVideo[] = [
  {
    id: "mit-python-1",
    title: "Lecture 1: What is Computation?",
    provider: "MIT OpenCourseWare",
    description: "Dr. Ana Bell introduces computation, computational thinking, and basic Python syntax.",
    providerUrl: `${courseUrl}lecture-1-what-is-computation/`,
    embedUrl: "https://www.youtube-nocookie.com/embed/nykOeWgQcHM",
    lesson: 1,
  },
  {
    id: "mit-python-2",
    title: "Lecture 2: Branching and Iteration",
    provider: "MIT OpenCourseWare",
    description: "Explore strings and indentation in Python, then branching, conditionals, iteration, and loops with Dr. Ana Bell.",
    providerUrl: `${courseUrl}lecture-2-branching-and-iteration/`,
    embedUrl: "https://www.youtube-nocookie.com/embed/0jljZRnHwOI",
    lesson: 2,
  },
  {
    id: "mit-python-3",
    title: "Lecture 3: String Manipulation, Guess and Check, Approximations, Bisection",
    provider: "MIT OpenCourseWare",
    description: "Dr. Ana Bell covers string manipulation, guess-and-check algorithms, approximate solutions, and bisection search.",
    providerUrl: `${courseUrl}lecture-3-string-manipulation-guess-and-check-approximations-bisection/`,
    embedUrl: "https://www.youtube-nocookie.com/embed/SE4P7IVCunE",
    lesson: 3,
  },
];

export const VIDEO_COURSE_TITLE = "Introduction to Computer Science and Programming in Python";

export function getVideoSelection(id?: string) {
  const index = id === undefined ? 0 : EDUCATIONAL_VIDEOS.findIndex((video) => video.id === id);
  const video = EDUCATIONAL_VIDEOS[index];
  return {
    video,
    previous: index > 0 ? EDUCATIONAL_VIDEOS[index - 1] : undefined,
    next: video ? EDUCATIONAL_VIDEOS[index + 1] : undefined,
    related: video ? EDUCATIONAL_VIDEOS.filter((item) => item.id !== video.id) : [],
  };
}