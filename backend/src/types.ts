export type Grade = "10th" | "11th" | "12th";
export type Stream = "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";
export type Role = "superAdmin" | "admin" | "teacher" | "student";

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  grade: Grade;
  stream: Stream;
  createdAt: string;
};

export type ClassSummary = {
  label: string;
  value: number;
};

export type ContentBase = {
  id: string;
  subject: string;
  title: string;
  grade: Grade;
  stream: Stream;
  createdAt: string;
};

export type NoteItem = ContentBase & {
  fileUrl: string;
  fileSize: string;
  pages: number;
  uploadDate: string;
};

export type PaperItem = ContentBase & {
  year: string;
  term: string;
  fileUrl: string;
  fileSize: string;
};

export type VideoItem = ContentBase & {
  instructor: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type QuizItem = ContentBase & {
  topic: string;
  durationMinutes: number;
  questions: QuizQuestion[];
};

export type NoticeItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  date: string;
  createdAt: string;
};

export type LiveClassItem = {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  teacherName: string;
  teacherPhoto?: string;
  teacherBio?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  timeZone?: string;
  meetingPlatform: "Google Meet" | "Zoom" | "Jitsi" | "LiveKit" | "Custom";
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  maxStudents: number;
  enrolledStudentsCount: number;
  language: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  bannerUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  status: "Draft" | "Published" | "Upcoming" | "Starting Soon" | "Live" | "Completed" | "Recording Available" | "Archived";
  allowRecording: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowStudentQuestions: boolean;
  attachments?: Array<{ title: string; type: string; url: string; size?: string }>;
  prerequisites?: string[];
  learningOutcomes?: string[];
  recordingUrl?: string;
  homeworkUrl?: string;
  grade: Grade;
  stream: Stream;
  createdAt: string;
};

export type AttendanceItem = {
  id: string;
  classId: string;
  studentName: string;
  email: string;
  joinTime: string;
  status: string;
  createdAt: string;
};

export type AppState = {
  users: User[];
  notes: NoteItem[];
  papers: PaperItem[];
  videos: VideoItem[];
  quizzes: QuizItem[];
  notices: NoticeItem[];
  liveClasses: LiveClassItem[];
  attendance: AttendanceItem[];
};
