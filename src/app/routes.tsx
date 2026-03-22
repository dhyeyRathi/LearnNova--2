import { createBrowserRouter } from 'react-router';
import Root from './pages/Root';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';
import QuizBuilderPage from './pages/admin/QuizBuilderPage';
import AdminQuizzesPage from './pages/admin/AdminQuizzesPage';
import AdminOptionsPage from './pages/admin/AdminOptionsPage';
import ReportingPage from './pages/admin/ReportingPage';
import StudentReportPage from './pages/admin/StudentReportPage';
import VerificationPage from './pages/VerificationPage';
import TutorApplicationPage from './pages/TutorApplicationPage';
import TutorApplicationsPage from './pages/admin/TutorApplicationsPage';
import QuizzesPage from './pages/QuizzesPage';
import ProgramsPage from './pages/ProgramsPage';
import BlogsPage from './pages/BlogsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MeetingsPage from './pages/instructor/MeetingsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },
      { path: 'confirm-email', Component: ConfirmEmailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'programs', Component: ProgramsPage },
      { path: 'blogs', Component: BlogsPage },
      { path: 'about', Component: AboutPage },
      { path: 'contact', Component: ContactPage },
      { path: 'my-courses', Component: MyCoursesPage },
      { path: 'course/:id', Component: CourseDetailPage },
      { path: 'lesson/:courseId/:lessonId', Component: LessonPlayerPage },
      { path: 'dashboard/admin', Component: AdminCoursesPage },
      { path: 'dashboard/instructor', Component: AdminCoursesPage },
      { path: 'admin/courses/:id/edit', Component: CourseEditorPage },
      { path: 'admin/courses/:id/quiz-builder', Component: QuizBuilderPage },
      { path: 'admin/quiz-builder', Component: QuizBuilderPage },
      { path: 'admin/quizzes', Component: AdminQuizzesPage },
      { path: 'admin/blogs', Component: AdminBlogsPage },
      { path: 'admin/users', Component: UserManagementPage },
      { path: 'admin/options', Component: AdminOptionsPage },
      { path: 'admin/reports', Component: ReportingPage },
      { path: 'admin/student/:studentId', Component: StudentReportPage },
      { path: 'instructor/quizzes', Component: AdminQuizzesPage },
      { path: 'instructor/meetings', Component: MeetingsPage },
      { path: 'instructor/reports', Component: ReportingPage },
      { path: 'instructor/student/:studentId', Component: StudentReportPage },
      { path: 'verification', Component: VerificationPage },
      { path: 'apply-admin', Component: TutorApplicationPage },
      { path: 'apply-tutor', Component: TutorApplicationPage },
      { path: 'quizzes', Component: QuizzesPage },
      { path: 'leaderboard', Component: LeaderboardPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'admin/applications', Component: TutorApplicationsPage },
      { path: '*', Component: NotFound },
    ],
  },
]);